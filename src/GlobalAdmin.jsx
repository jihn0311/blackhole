import { createGithubAdmin } from "./githubAdmin.js";
const webAdmin = !import.meta.env.DEV;
const githubApi = createGithubAdmin();
import { ContentEditor } from "./ContentEditor.jsx";
import React, { useState, useEffect } from "react";
import { validateSettings, settingsDiff } from "./settingsSchema.js";
import "./admin.css";

async function api(path, data) {
  if (webAdmin) return githubApi(path, data);
  const response = await fetch(`/__admin/${path}`, {
    method: data ? "POST" : "GET",
    headers: {
      "X-Admin-Request": "1",
      ...(data ? { "Content-Type": "application/json" } : {}),
    },
    ...(data ? { body: JSON.stringify(data) } : {}),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "요청 실패");
  return result;
}
const multipliers = [
  ["levelMassMultiplier", "레벨업 필요 질량", "낮추면 더 빠르게 레벨업합니다."],
  [
    "upgradeCostMultiplier",
    "모든 강화 가격",
    "기본 가격과 단계별 비용에 함께 적용합니다.",
  ],
  [
    "gainMultiplier",
    "천체 흡수 질량",
    "높이면 한 번 흡수할 때 더 많이 성장합니다.",
  ],
  [
    "cooldownMultiplier",
    "천체 생성 쿨타임",
    "낮추면 더 자주 소환할 수 있습니다.",
  ],
];
const labels = {
  removedPlanets: "삭제할 천체",
  levelMassMultiplier: "레벨업 필요 질량 배율",
  upgradeCostMultiplier: "강화 가격 배율",
  gainMultiplier: "흡수 질량 배율",
  cooldownMultiplier: "쿨타임 배율",
  gameTitle: "게임 이름",
  subtitle: "부제",
};
export function GlobalAdmin() {
  const [password, setPassword] = useState("");
  const [local, setLocal] = useState(null),
    [config, setConfig] = useState(null),
    [remote, setRemote] = useState(null),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("설정을 불러오는 중입니다."),
    [confirm, setConfirm] = useState(null),
    [commit, setCommit] = useState(null),
    [deployment, setDeployment] = useState(null);
  const [section, setSection] = useState("balance");
  async function loadLocal() {
    const value = await api("local");
    setLocal(value);
    setConfig(value.config);
    setMessage(
      "설정을 불러왔습니다. 공개 설정을 연결하면 변경 사항을 비교할 수 있습니다.",
    );
  }
  useEffect(() => {
    loadLocal().catch((e) => setMessage(e.message));
  }, []);
  useEffect(() => {
    if (!commit) return;
    let cancelled = false;
    const poll = async () => {
      try {
        const result = await api(`deployment?sha=${commit}`);
        if (!cancelled) {
          setDeployment(result);
          if (result.status === "completed") clearInterval(timer);
        }
      } catch (e) {
        if (!cancelled) setDeployment({ status: "unknown", error: e.message });
      }
    };
    const timer = setInterval(poll, 10000);
    poll();
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [commit]);
  const run = async (fn) => {
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  };
  const changes = remote && config ? settingsDiff(remote.config, config) : [];
  const edit = (key, value) => setConfig((s) => ({ ...s, [key]: value }));
  const number = (v) => (v === "" ? "" : Number(v));
  async function preview() {
    const valid = validateSettings(config);
    const result = await api("preview", {
      config: valid,
      revision: local.revision,
    });
    setLocal((s) => ({ ...s, config: valid, revision: result.revision }));
    setConfig(valid);
    setMessage(
      "로컬 적용 완료. 게임 미리보기를 열어 확인하세요. 아직 공개 게임은 바뀌지 않았습니다.",
    );
  }
  async function publish() {
    const valid = validateSettings(config);
    const result = await api("publish", {
      config: valid,
      sha: remote.sha,
      revision: local.revision,
    });
    setRemote({ config: valid, sha: result.sha });
    setLocal((s) => ({
      ...s,
      revision: result.revision,
      ...(result.localSynced ? { config: valid } : {}),
    }));
    setConfig(valid);
    setCommit(result.commit);
    setDeployment({ status: "waiting" });
    setMessage(
      result.localSynced
        ? "GitHub에 설정을 저장했습니다. 아래에서 공개 배포 결과를 확인하세요."
        : "GitHub 저장은 완료됐지만 로컬 파일 동기화에 실패했습니다. 로컬 설정을 다시 불러오세요.",
    );
  }
  const askPublish = () => {
    try {
      validateSettings(config);
      setConfirm("publish");
    } catch (e) {
      setMessage(e.message);
    }
  };
  const dirty =
    !!config && !!local && settingsDiff(local.config, config).length > 0;
  useEffect(() => {
    if (!dirty) return;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  if (!config)
    return (
      <main className="admin-shell">
        <h1>공개 게임 관리</h1>
        <p role="status">{message}</p>
        {webAdmin && <p>GitHub에서 blackhole 저장소만 선택한 토큰을 발급하세요. Contents 읽기·쓰기와 Actions 읽기 권한이 필요합니다. 토큰은 이 탭에서만 사용하며 로그아웃하거나 새로고침하면 사라집니다. 기존 로컬 관리자 비밀번호는 여기서 사용하지 않습니다. <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noreferrer">GitHub에서 토큰 만들기 ↗</a></p>}
        <form
          className="admin-card"
          style={{ maxWidth: 440 }}
          onSubmit={(e) => {
            e.preventDefault();
            run(async () => {
              await api("login", { password });
              setPassword("");
              await loadLocal();
            });
          }}
        >
          <label className="admin-setting">
            {webAdmin ? "GitHub 접근 토큰" : "관리자 비밀번호"}
            <input
              type="password"
              autoComplete={webAdmin ? "off" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              maxLength={256}
            />
          </label>
          <button className="admin-primary" disabled={busy}>
            로그인
          </button>
        </form>
      </main>
    );
  const fieldName = (field) => {
    const parts = field.split(".");
    if (parts[0] === "planets")
      return `${local.bodies.find((b) => b.id === parts[1])?.name || parts[1]} · ${{ mass: "흡수 질량", unlock: "해금 질량", cooldown: "쿨타임", name: "이름", fact: "도감 설명" }[parts[2]] || "설정"}`;
    if (parts[0] === "upgradeBases")
      return `${local.upgrades.find((u) => u.id === parts[1])?.name} 기본 가격`;
    if (parts[0] === "scenes")
      return `도입부 ${Number(parts[1]) + 1}장면 · ${parts[2] === "title" ? "제목" : "설명"}`;
    return labels[field] || field;
  };
  return (
    <main className="admin-shell global-admin">
      <header className="admin-header">
        <div>
          <span className="admin-eyebrow">
            EVENT HORIZON / PUBLISHING CONSOLE
          </span>
          <h1>공개 게임 관리</h1>
          <p>설정 편집 → 변경 검토 → 공개 배포</p>
        </div>
        <div className="admin-actions">
          {!webAdmin && <a className="admin-link" href="?admin=save">
            내 기록 테스트 ↗</a>}
          <a
            className="admin-link"
            href="https://jihn0311.github.io/blackhole/"
            target="_blank"
            rel="noreferrer"
          >
            공개 게임 ↗
          </a>
          <button
            disabled={busy}
            onClick={() =>
              run(async () => {
                await api("logout", {});
                setConfig(null);
                setRemote(null);
                setCommit(null);
                setMessage("로그아웃했습니다.");
              })
            }
          >
            로그아웃
          </button>
        </div>
      </header>
      <aside className="admin-notice">
        배포하면 모든 플레이어에게 같은 설정이 적용됩니다. 기존 저장 기록은
        유지되지만 레벨·해금 상태는 새 기준으로 계산됩니다. 이미 열린 게임은
        새로고침 후 반영됩니다.
      </aside>
      <div className="admin-connection">
        <div>
          <b>{remote ? "● GitHub 연결됨" : "○ GitHub 연결 전"}</b>
          <p>jihn0311/blackhole · main · 게임 설정 파일만 배포</p>
        </div>
        <button
          disabled={busy}
          onClick={() =>
            run(async () => {
              setRemote(await api("remote"));
              setMessage("현재 GitHub 설정과 편집 내용을 비교할 수 있습니다.");
            })
          }
        >
          {remote ? "공개 설정 다시 확인" : "GitHub 연결 · 공개 설정 확인"}
        </button>
      </div>
      <div className="admin-tabs" role="group" aria-label="편집 항목">
        {[
          ["balance", "성장과 강화"],
          ["planets", "천체 설정"],
          ["story", "이름과 이야기"],
          ["content", "천체·엔딩 추가"],
          ["review", `변경 검토 ${changes.length}`],
        ].map(([id, name]) => (
          <button
            key={id}
            aria-pressed={section === id}
            onClick={() => setSection(id)}
          >
            {name}
          </button>
        ))}
      </div>
      <fieldset disabled={busy} className="admin-editor">
        {section === "content" && (
          <ContentEditor config={config} onChange={edit} />
        )}
        {section === "balance" && (
          <div className="admin-grid">
            <section className="admin-card">
              <h2>전체 난이도</h2>
              <p>
                1배는 원래 수치입니다. 0.1~10배 범위에서 조절할 수 있습니다.
              </p>
              {multipliers.map(([key, name, help]) => (
                <label className="admin-setting" key={key}>
                  <span>{name}</span>
                  <small>{help}</small>
                  <div>
                    <input
                      aria-label={name}
                      type="number"
                      min="0.1"
                      max="10"
                      step="0.1"
                      value={config[key]}
                      onChange={(e) => edit(key, number(e.target.value))}
                    />
                    <b>배</b>
                  </div>
                </label>
              ))}
            </section>
            <section className="admin-card">
              <h2>계열별 기본 강화 가격</h2>
              <p>
                단계별 증가 공식은 유지하며 시작 가격을 변경합니다. 전체 강화
                가격 배율도 함께 적용됩니다.
              </p>
              {local.upgrades.map((u) => (
                <label className="admin-setting" key={u.id}>
                  <span>{u.name}</span>
                  <div>
                    <input
                      aria-label={`${u.name} 기본 가격`}
                      type="number"
                      min="1"
                      max="1000000"
                      value={config.upgradeBases[u.id] ?? u.base}
                      onChange={(e) =>
                        edit("upgradeBases", {
                          ...config.upgradeBases,
                          [u.id]: number(e.target.value),
                        })
                      }
                    />
                    <b>P</b>
                  </div>
                </label>
              ))}
            </section>
          </div>
        )}
        {section === "planets" && (
          <section className="admin-card">
            <h2>천체별 수치와 도감 설명</h2>
            <p>
              해금 질량은 위에서 아래로 같거나 커야 합니다. 첫 소행성의 해금
              질량은 0으로 유지됩니다.
            </p>
            <div className="admin-planet-list">
              {local.bodies.map((b) => {
                const p = { ...b, ...config.planets[b.id] };
                const change = (key, value) =>
                  edit("planets", {
                    ...config.planets,
                    [b.id]: { ...config.planets[b.id], [key]: value },
                  });
                return (
                  <article key={b.id}>
                    <h3>{b.name}{config.removedPlanets?.includes(b.id) ? " · 삭제 예정" : ""}</h3>
                    <button disabled={b.id === 'asteroid'} onClick={() => {
                      const removed = config.removedPlanets || [];
                      if (removed.includes(b.id)) edit('removedPlanets', removed.filter(id => id !== b.id));
                      else if (window.confirm(`${b.name}을 소환 목록과 도감에서 삭제할까요? 배포 후 적용됩니다. 관련 미션은 소행성 미션으로 대체됩니다.`)) edit('removedPlanets', [...removed, b.id]);
                    }}>{b.id === 'asteroid' ? '첫 천체 · 삭제 불가' : config.removedPlanets?.includes(b.id) ? '삭제 취소 · 복원' : '이 천체 삭제'}</button>
                    <div className="admin-planet-fields">
                      {[
                        ["name", "이름"],
                        ["mass", "흡수 질량"],
                        ["unlock", "해금 질량"],
                        ["cooldown", "쿨타임(초)"],
                      ].map(([key, name]) => (
                        <label key={key}>
                          {name}
                          <input
                            aria-label={`${b.name} ${name}`}
                            type={key === "name" ? "text" : "number"}
                            disabled={key === "unlock" && b.id === "asteroid"}
                            step={key === "cooldown" ? "0.1" : "1"}
                            value={p[key]}
                            onChange={(e) =>
                              change(
                                key,
                                key === "name"
                                  ? e.target.value
                                  : number(e.target.value),
                              )
                            }
                          />
                        </label>
                      ))}
                    </div>
                    <label className="admin-setting">
                      도감 설명
                      <textarea
                        aria-label={`${b.name} 도감 설명`}
                        maxLength={500}
                        value={p.fact}
                        onChange={(e) => change("fact", e.target.value)}
                      />
                    </label>
                  </article>
                );
              })}
            </div>
          </section>
        )}
        {section === "story" && (
          <section className="admin-card">
            <h2>게임 이름과 도입부 문구</h2>
            <label className="admin-setting">
              게임 이름
              <input
                maxLength={50}
                value={config.gameTitle}
                onChange={(e) => edit("gameTitle", e.target.value)}
              />
            </label>
            <label className="admin-setting">
              부제
              <input
                maxLength={80}
                value={config.subtitle}
                onChange={(e) => edit("subtitle", e.target.value)}
              />
            </label>
            {config.scenes.map((scene, i) => (
              <article className="admin-scene" key={i}>
                <h3>도입부 {i + 1}장면</h3>
                <label className="admin-setting">
                  제목
                  <input
                    aria-label={`${i + 1}장면 제목`}
                    maxLength={60}
                    value={scene.title}
                    onChange={(e) =>
                      edit(
                        "scenes",
                        config.scenes.map((s, j) =>
                          i === j ? { ...s, title: e.target.value } : s,
                        ),
                      )
                    }
                  />
                </label>
                <label className="admin-setting">
                  설명
                  <textarea
                    aria-label={`${i + 1}장면 설명`}
                    maxLength={500}
                    value={scene.text}
                    onChange={(e) =>
                      edit(
                        "scenes",
                        config.scenes.map((s, j) =>
                          i === j ? { ...s, text: e.target.value } : s,
                        ),
                      )
                    }
                  />
                </label>
              </article>
            ))}
          </section>
        )}
        {section === "review" && (
          <section className="admin-card">
            <h2>공개 설정과 비교</h2>
            {!remote ? (
              <p>먼저 GitHub 연결 버튼을 눌러 공개 설정을 불러오세요.</p>
            ) : !changes.length ? (
              <p>공개 설정과 같습니다.</p>
            ) : (
              <div className="admin-diff">
                {changes.map((c) => (
                  <article key={c.field}>
                    <b>{fieldName(c.field)}</b>
                    <div>
                      <del>
                        {String(
                          typeof c.before === "object"
                            ? JSON.stringify(c.before)
                            : c.before,
                        )}
                      </del>
                      <span>→</span>
                      <ins>
                        {String(
                          typeof c.after === "object"
                            ? JSON.stringify(c.after)
                            : c.after,
                        )}
                      </ins>
                    </div>
                  </article>
                ))}
              </div>
            )}
            <div className="admin-actions">
              <button onClick={() => setConfirm("reload")}>
                설정 다시 불러오기
              </button>
              <button disabled={!remote} onClick={() => setConfirm("remote")}>
                공개 설정으로 편집 내용 되돌리기
              </button>
            </div>
          </section>
        )}
      </fieldset>
      {commit && (
        <section className="admin-card admin-deployment" role="status">
          <h2>배포 진행</h2>
          <p>
            {deployment?.conclusion === "success"
              ? "배포 완료! 공개 게임을 새로고침하면 새 설정이 적용됩니다."
              : deployment?.status === "completed"
                ? "배포가 완료되지 않았습니다. GitHub 실행 결과를 확인해주세요."
                : deployment?.error ||
                  "GitHub에서 테스트와 빌드를 실행하고 있습니다. 완료까지 보통 1~3분 걸립니다."}
          </p>
          <a
            target="_blank"
            rel="noreferrer"
            href={
              deployment?.url ||
              `https://github.com/jihn0311/blackhole/commit/${commit}`
            }
          >
            GitHub 진행 내역 ↗
          </a>
        </section>
      )}
      <footer className="admin-savebar">
        <div role="status">
          <b>
            {busy
              ? "● 작업 중"
              : dirty
                ? "● 편집 중인 변경 있음"
                : "● 설정 편집 준비 완료"}
          </b>
          <p>{message}</p>
        </div>
        {!webAdmin && <button disabled={busy} onClick={() => run(preview)}>
          로컬 적용</button>}
        <a
          className="admin-link"
          href="./?preview"
          target="_blank"
          rel="noreferrer"
        >
          현재 게임 보기 ↗
        </a>
        <button
          className="admin-primary"
          disabled={busy || !remote || !changes.length}
          onClick={askPublish}
        >
          공개 게임에 배포
        </button>
      </footer>
      {confirm && (
        <div className="admin-confirm-backdrop">
          <section
            className="admin-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="publish-title"
          >
            <h2 id="publish-title">
              {confirm === "publish"
                ? "모든 플레이어에게 적용할까요?"
                : "편집 내용 변경"}
            </h2>
            <p>
              {confirm === "publish"
                ? `${changes.length}개 설정을 GitHub main에 저장하고 공개 게임을 다시 배포합니다. 현재 플레이어의 저장 데이터는 삭제하지 않습니다.`
                : confirm === "remote"
                  ? "편집 내용을 현재 GitHub 설정으로 되돌립니다. 로컬 적용 또는 배포하기 전까지 파일은 바뀌지 않습니다."
                  : "저장하지 않은 편집을 버리고 로컬 파일을 다시 불러옵니다."}
            </p>
            {confirm === "publish" && (
              <ul className="admin-confirm-list">
                {changes.map((c) => (
                  <li key={c.field}>{fieldName(c.field)}</li>
                ))}
              </ul>
            )}
            <div className="admin-actions">
              <button autoFocus onClick={() => setConfirm(null)}>
                취소
              </button>
              <button
                className="admin-primary"
                onClick={() => {
                  const action = confirm;
                  setConfirm(null);
                  if (action === "publish") run(publish);
                  else if (action === "reload") run(loadLocal);
                  else setConfig(structuredClone(remote.config));
                }}
              >
                {confirm === "publish" ? "변경 사항 배포" : "확인"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
