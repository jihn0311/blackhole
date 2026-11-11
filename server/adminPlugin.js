import { execFile } from "node:child_process";
import { readFile, writeFile, rename } from "node:fs/promises";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { validateSettings } from "../src/settingsSchema.js";
import { bodies, upgrades } from "../src/game.js";
import { passwordMatches, passwordRecord, createSessions } from "./adminAuth.js";

const REPO = "jihn0311/blackhole";
const FILE = "src/gameSettings.json";
const BASE = `https://api.github.com/repos/${REPO}`;
const digest = (text) => createHash("sha256").update(text).digest("hex");
export function trustedRequest(req, publicOrigin) {
  if (publicOrigin) {
    const expected = new URL(publicOrigin);
    return expected.protocol === "https:" && req.headers.host === expected.host && (req.headers.origin === expected.origin || (req.method === "GET" && !req.headers.origin && req.headers["sec-fetch-site"] === "same-origin")) && req.headers["x-admin-request"] === "1" && (!req.headers["sec-fetch-site"] || req.headers["sec-fetch-site"] === "same-origin");
  }
  const host = req.headers.host || "";
  if (!/^(127\.0\.0\.1|localhost):\d+$/.test(host)) return false;
  if (req.headers["x-admin-request"] !== "1") return false;
  if (req.headers.origin && req.headers.origin !== `http://${host}`)
    return false;
  return (
    !req.headers["sec-fetch-site"] ||
    req.headers["sec-fetch-site"] === "same-origin"
  );
}
export function adminPlugin(options = {}) {
  const hosted = !!options.publicOrigin;
  const hostedRecord = hosted && passwordRecord(options.password);
  let busy = false;
  const sessions = createSessions();
  let failed = 0,
    blockedUntil = 0;
  return {
    name: "local-publishing-admin",
    apply: "serve",
    handleHotUpdate(ctx) {
      if (ctx.file.replaceAll("\\", "/").endsWith("/src/gameSettings.json"))
        return [];
    },
    configureServer(server) {
      const path = resolve(server.config.root, FILE);
      async function credential() {
        const token = process.env.BLACKHOLE_GITHUB_TOKEN;
        if (token) return token;
        if (hosted) throw new Error("서버에 GitHub 연결 키가 설정되지 않았습니다.");
        // Use the signed-in Git credential manager. Never send the credential to the browser.
        return new Promise((yes, no) => {
          const child = execFile(
            "git",
            [
              "-c",
              `safe.directory=${server.config.root.replaceAll("\\", "/")}`,
              "credential",
              "fill",
            ],
            {
              cwd: server.config.root,
              timeout: 15000,
              windowsHide: true,
              env: {
                ...process.env,
                GIT_TERMINAL_PROMPT: "0",
                GCM_INTERACTIVE: "never",
              },
              maxBuffer: 64 * 1024,
            },
            (error, stdout) => {
              const password = stdout
                ?.split(/\r?\n/)
                .find((x) => x.startsWith("password="))
                ?.slice(9);
              if (error || !password)
                no(
                  new Error(
                    "GitHub 인증이 필요합니다. 이 컴퓨터에서 GitHub에 로그인한 Git 자격 증명 또는 BLACKHOLE_GITHUB_TOKEN 환경 변수를 사용하세요.",
                  ),
                );
              else yes(password);
            },
          );
          child.stdin.end(
            "protocol=https\nhost=github.com\npath=jihn0311/blackhole.git\n\n",
          );
        });
      }
      async function github(suffix, options = {}) {
        const token = await credential();
        const response = await fetch(BASE + suffix, {
          ...options,
          signal: AbortSignal.timeout(20000),
          headers: {
            Accept: "application/vnd.github+json",
            Authorization: `Bearer ${token}`,
            "X-GitHub-Api-Version": "2022-11-28",
            "Content-Type": "application/json",
            ...options.headers,
          },
        });
        if (!response.ok) {
          if (response.status === 409 || response.status === 422)
            throw new Error(
              "공개 설정이 변경되었습니다. 공개 설정을 다시 불러와 비교한 후 배포하세요.",
            );
          if (response.status === 401 || response.status === 403)
            throw new Error(
              "GitHub 인증 또는 저장소 쓰기 권한을 확인해주세요.",
            );
          if (response.status === 404)
            throw new Error(
              "배포 연결 파일을 찾지 못했습니다. 관리자 기능의 첫 배포가 필요합니다.",
            );
          throw new Error(
            `GitHub 연결 실패 (${response.status}). 잠시 후 다시 시도해주세요.`,
          );
        }
        return response.json();
      }
      async function remote() {
        const file = await github(`/contents/${FILE}?ref=main`);
        return {
          sha: file.sha,
          config: validateSettings(
            JSON.parse(Buffer.from(file.content, "base64").toString("utf8")),
          ),
        };
      }
      async function body(req) {
        let raw = "";
        for await (const chunk of req) {
          raw += chunk;
          if (Buffer.byteLength(raw) > 128 * 1024)
            throw new Error("설정 파일이 너무 큽니다.");
        }
        return JSON.parse(raw);
      }
      server.middlewares.use("/__admin", async (req, res) => {
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.setHeader("Cache-Control", "no-store");
        const respond = (code, value) => {
          res.statusCode = code;
          res.end(JSON.stringify(value));
        };
        if (!trustedRequest(req, options.publicOrigin))
          return respond(403, {
            error: "이 컴퓨터의 관리자 화면에서만 요청할 수 있습니다.",
          });
        const url = new URL(req.url, "http://localhost");
        const route = url.pathname;
        try {
          const token = req.headers.cookie?.match(
            /(?:^|;\s*)eh_admin=([a-f0-9]{64})(?:;|$)/,
          )?.[1];
          if (req.method === "POST" && route === "/login") {
            if (Date.now() < blockedUntil)
              return respond(429, {
                error: "로그인 시도가 많습니다. 1분 후 다시 시도해주세요.",
              });
            const data = await body(req);
            let record;
            try {
              record = hosted ? hostedRecord : JSON.parse(
                await readFile(
                  resolve(server.config.root, ".admin-auth.json"),
                  "utf8",
                ),
              );
            } catch {
              return respond(503, {
                error: "이 컴퓨터에 관리자 비밀번호가 설정되지 않았습니다.",
              });
            }
            if (!passwordMatches(data.password, record)) {
              failed++;
              if (failed >= 5) {
                blockedUntil = Date.now() + 60000;
                failed = 0;
              }
              return respond(401, { error: "비밀번호가 맞지 않습니다." });
            }
            failed = 0;
            res.setHeader(
              "Set-Cookie",
              `eh_admin=${sessions.create()}; HttpOnly; SameSite=Strict; Path=/__admin; Max-Age=28800${hosted ? "; Secure" : ""}`,
            );
            return respond(200, { ok: true });
          }
          if (!sessions.valid(token))
            return respond(401, { error: "관리자 비밀번호로 로그인해주세요." });
          if (req.method === "POST" && route === "/logout") {
            sessions.remove(token);
            res.setHeader(
              "Set-Cookie",
              `eh_admin=; HttpOnly; SameSite=Strict; Path=/__admin; Max-Age=0${hosted ? "; Secure" : ""}`,
            );
            return respond(200, { ok: true });
          }
          if (req.method === "GET" && route === "/local") {
            if (hosted) {
              const value = await remote();
              return respond(200, { ...value, revision: value.sha, bodies, upgrades, repo: REPO });
            }
            const raw = await readFile(path, "utf8");
            return respond(200, {
              config: validateSettings(JSON.parse(raw)),
              revision: digest(raw),
              bodies,
              upgrades,
              repo: REPO,
            });
          }
          if (req.method === "GET" && route === "/remote")
            return respond(200, await remote());
          if (req.method === "GET" && route === "/deployment") {
            const sha = url.searchParams.get("sha");
            if (!/^[a-f0-9]{40}$/.test(sha || ""))
              throw new Error("잘못된 배포 번호입니다.");
            const data = await github(
              `/actions/runs?head_sha=${sha}&per_page=10`,
            );
            const run = data.workflow_runs.find(
              (r) =>
                r.head_sha === sha && r.name === "Deploy game to GitHub Pages",
            );
            return respond(
              200,
              run
                ? {
                    status: run.status,
                    conclusion: run.conclusion,
                    url: run.html_url,
                  }
                : { status: "waiting", conclusion: null },
            );
          }
          if (
            req.method !== "POST" ||
            !["/preview", "/publish"].includes(route)
          )
            return respond(404, { error: "지원하지 않는 요청입니다." });
          if (!req.headers["content-type"]?.startsWith("application/json"))
            return respond(415, { error: "JSON 요청만 지원합니다." });
          if (busy)
            return respond(409, {
              error: "다른 작업이 진행 중입니다. 완료 후 다시 시도해주세요.",
            });
          busy = true;
          try {
            const data = await body(req),
              config = validateSettings(data.config),
              serialized = JSON.stringify(config, null, 2) + "\n";
            const old = hosted ? "" : await readFile(path, "utf8");
            if (!hosted && data.revision !== digest(old))
              return respond(409, {
                error:
                  "로컬 설정이 다른 창에서 변경되었습니다. 로컬 설정을 다시 불러오세요.",
              });
            if (route === "/preview") {
              if (hosted) return respond(400, { error: "변경 검토 후 공개 게임에 배포해주세요." });
              await writeFile(path + ".tmp", serialized);
              await rename(path + ".tmp", path);
              return respond(200, { revision: digest(serialized) });
            }
            const current = await remote();
            if (data.sha !== current.sha)
              return respond(409, {
                error:
                  "공개 설정이 다른 곳에서 변경되었습니다. 다시 불러와 비교하세요.",
              });
            if (JSON.stringify(current.config) === JSON.stringify(config))
              throw new Error(
                "공개 설정과 같은 내용입니다. 배포할 변경이 없습니다.",
              );
            // Only this whitelisted settings file is committed; no working files or secrets are uploaded.
            const result = await github(`/contents/${FILE}`, {
              method: "PUT",
              body: JSON.stringify({
                message: "Update game settings from local admin",
                content: Buffer.from(serialized).toString("base64"),
                sha: current.sha,
                branch: "main",
              }),
            });
            if (hosted) return respond(200, { commit: result.commit.sha, sha: result.content.sha, revision: result.content.sha, localSynced: true });
            let localSynced = true;
            try {
              await writeFile(path + ".tmp", serialized);
              await rename(path + ".tmp", path);
            } catch {
              localSynced = false;
            }
            return respond(200, {
              commit: result.commit.sha,
              url: result.commit.html_url,
              sha: result.content.sha,
              revision: localSynced ? digest(serialized) : digest(old),
              localSynced,
            });
          } finally {
            busy = false;
          }
        } catch (error) {
          const message =
            error.name === "TimeoutError"
              ? "GitHub 응답 시간이 초과되었습니다. 다시 시도해주세요."
              : error instanceof SyntaxError
                ? "올바른 JSON 설정이 아닙니다."
                : error.message;
          respond(400, { error: message });
        }
      });
    },
  };
}
