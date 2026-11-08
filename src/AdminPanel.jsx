import React, { useState } from "react";
import {
  bodies,
  upgrades,
  fresh,
  load,
  level,
  levelFloor,
  SAVE_KEY,
  SAVE_VERSION,
  missions,
  isUnlocked,
} from "./game.js";
import { adminNumber, adminPreset, parseAdminSave } from "./adminState.js";
import "./admin.css";

const BACKUP = "event-horizon-admin-backup";
const endings = [
  ["normal", "일반 엔딩"],
  ["hacking", "변환자 엔딩"],
  ["survivor", "생존자 엔딩"],
  ["happy", "The Last Ending"],
];
const fields = [
  ["points", "보유 포인트"],
  ["shards", "특이점 조각"],
  ["rebirths", "환생 횟수"],
  ["mass", "현재 질량"],
];

export function AdminPanel() {
  const [state, setState] = useState(load);
  const [message, setMessage] = useState(
    "설정을 바꾼 뒤 저장하면 이 브라우저의 게임에 적용됩니다.",
  );
  const [dirty, setDirty] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [draft, setDraft] = useState({});
  const [hasBackup, setHasBackup] = useState(() => {
    try {
      return !!localStorage.getItem(BACKUP);
    } catch {
      return false;
    }
  });
  const change = (fn) => {
    setState((s) => fn(s));
    setDirty(true);
  };
  const attempt = (fn) => {
    try {
      fn();
    } catch (e) {
      setMessage(e.message || "작업을 완료하지 못했습니다.");
    }
  };
  function save(openGame = false) {
    attempt(() => {
      if (Object.keys(draft).length)
        throw new Error("입력 중인 항목의 적용 버튼을 먼저 눌러주세요.");
      const old = localStorage.getItem(SAVE_KEY);
      localStorage.setItem(
        BACKUP,
        old || JSON.stringify({ version: SAVE_VERSION, state: fresh() }),
      );
      localStorage.setItem(
        SAVE_KEY,
        JSON.stringify({ version: SAVE_VERSION, state }),
      );
      setHasBackup(true);
      setDirty(false);
      setMessage(
        "저장했습니다. 이전 상태는 저장 전 복원으로 되돌릴 수 있습니다.",
      );
      if (openGame) {
        localStorage.setItem("event-horizon-intro-v3", "seen");
        location.assign(location.pathname);
      }
    });
  }
  function numeric(key, label, value, apply, max) {
    return (
      <form
        className="admin-field"
        key={key}
        onSubmit={(e) => {
          e.preventDefault();
          attempt(() => {
            const n = adminNumber(draft[key] ?? value, max);
            const nextState = apply(state, n);
            change(() => nextState);
            setDraft((d) => {
              const next = { ...d };
              delete next[key];
              return next;
            });
            setMessage(`${label} 적용 완료. 저장 후 게임에서 확인하세요.`);
          });
        }}
      >
        <label htmlFor={`admin-${key}`}>{label}</label>
        <div>
          <input
            id={`admin-${key}`}
            type="number"
            min="0"
            max={max || Number.MAX_SAFE_INTEGER}
            step="1"
            value={draft[key] ?? value}
            onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}
          />
          <button>적용</button>
        </div>
      </form>
    );
  }
  function download() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify({ version: SAVE_VERSION, state }, null, 2)], {
        type: "application/json",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "event-horizon-backup.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function importFile(e) {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    try {
      if (file.size > 1024 * 1024)
        throw new Error("1MB 이하의 백업 파일만 불러올 수 있습니다.");
      const next = parseAdminSave(await file.text());
      setConfirmation({
        text: "파일의 기록으로 편집 중인 상태를 바꿀까요?",
        action: () => {
          setState(next);
          setDraft({});
          setDirty(true);
          setMessage("백업을 불러왔습니다. 저장하면 적용됩니다.");
        },
      });
    } catch (error) {
      setMessage(`불러오기 실패: ${error.message}`);
    }
  }
  return (
    <main className="admin-shell">
      <header className="admin-header">
        <div>
          <span className="admin-eyebrow">EVENT HORIZON / LOCAL ADMIN</span>
          <h1>우주 관제실</h1>
          <p>게임 진행과 엔딩을 점검하는 개발 전용 관리 화면</p>
        </div>
        <button
          onClick={() => {
            if (!dirty && !Object.keys(draft).length)
              location.assign(location.pathname);
            else
              setConfirmation({
                text: "저장하지 않은 변경을 버리고 게임으로 돌아갈까요?",
                action: () => location.assign(location.pathname),
              });
          }}
        >
          게임으로 돌아가기 ↗
        </button>
      </header>
      <aside className="admin-notice">
        이 개발 주소의 브라우저 기록만 관리합니다. 공개 사이트의 플레이어 기록은
        바뀌지 않습니다. 다른 게임 탭은 닫고 테스트해주세요.
      </aside>
      <div className="admin-stats">
        <article>
          <span>현재 레벨</span>
          <strong>
            {level(state.mass)} <small>LV</small>
          </strong>
        </article>
        <article>
          <span>강화 진행</span>
          <strong>
            {Object.values(state.upgrades).reduce((a, b) => a + b, 0)}{" "}
            <small>/ 80</small>
          </strong>
        </article>
        <article>
          <span>천체 해금</span>
          <strong>
            {bodies.filter((b) => isUnlocked(state, b)).length}{" "}
            <small>/ 15</small>
          </strong>
        </article>
        <article>
          <span>엔딩 기록</span>
          <strong>
            {state.unlockedEndings.length} <small>/ 4</small>
          </strong>
        </article>
      </div>
      <div className="admin-grid">
        <section className="admin-card">
          <h2>진행 상태</h2>
          <p>값을 입력하고 적용하세요. 레벨을 바꾸면 질량도 함께 바뀝니다.</p>
          {numeric(
            "level",
            "레벨",
            level(state.mass),
            (s, n) => {
              if (n < 1) throw new Error("레벨은 1 이상이어야 합니다.");
              return {
                ...s,
                mass: levelFloor(n),
                bestMass: Math.max(s.bestMass, levelFloor(n)),
              };
            },
            1000,
          )}
          {fields.map(([key, label]) =>
            numeric(key, label, state[key], (s, n) => ({
              ...s,
              [key]: n,
              ...(key === "mass" ? { bestMass: Math.max(s.bestMass, n) } : {}),
            })),
          )}
          {numeric(
            "mission",
            "완료한 미션 수",
            state.mission,
            (s, n) => ({ ...s, mission: n }),
            missions.length,
          )}
          <label className="admin-check">
            <input
              type="checkbox"
              checked={state.autoEnabled}
              onChange={(e) =>
                change((s) => ({ ...s, autoEnabled: e.target.checked }))
              }
            />
            해금된 자동 생성 사용
          </label>
          <label className="admin-check">
            <input
              type="checkbox"
              checked={state.cheatUsed}
              onChange={(e) =>
                change((s) => ({ ...s, cheatUsed: e.target.checked }))
              }
            />
            치트 엔딩 경로 사용
          </label>
        </section>
        <section className="admin-card">
          <h2>스킬 강화</h2>
          <p>각 계열의 강화 단계를 독립적으로 조절합니다.</p>
          <button
            onClick={() =>
              change((s) => ({
                ...s,
                upgrades: Object.fromEntries(
                  upgrades.map((u) => [u.id, u.max]),
                ),
              }))
            }
          >
            모든 강화 최대 단계로
          </button>
          {upgrades.map((u) =>
            numeric(
              u.id,
              `${u.name} · 최대 ${u.max}`,
              state.upgrades[u.id],
              (s, n) => ({ ...s, upgrades: { ...s.upgrades, [u.id]: n } }),
              u.max,
            ),
          )}
        </section>
        <section className="admin-card">
          <h2>엔딩 테스트</h2>
          <p>프리셋으로 상태를 준비한 뒤 ‘저장하고 게임 실행’을 누르세요.</p>
          <div className="admin-presets">
            {endings.map(([id, name]) => (
              <button
                key={id}
                onClick={() =>
                  setConfirmation({
                    text: `${name} 테스트 상태로 바꿀까요? 생존자·최종 엔딩 테스트는 새 우주 상태를 사용합니다.`,
                    action: () => {
                      setState((s) => adminPreset(id, s));
                      setDraft({});
                      setDirty(true);
                      setMessage(`${name} 테스트 준비 완료.`);
                    },
                  })
                }
              >
                {name}
                <span>
                  {id === "survivor"
                    ? "아무 조작 없이 2분 대기"
                    : id === "happy"
                      ? "블랙홀 중앙 버튼으로 시작"
                      : "400레벨에서 연출 시작"}
                </span>
              </button>
            ))}
          </div>
          <h3>엔딩 해금 기록</h3>
          {endings.map(([id, name]) => (
            <label className="admin-check" key={id}>
              <input
                type="checkbox"
                checked={state.unlockedEndings.includes(id)}
                onChange={(e) =>
                  change((s) => ({
                    ...s,
                    endingSeen: false,
                    endingType: null,
                    unlockedEndings: e.target.checked
                      ? [...s.unlockedEndings, id]
                      : s.unlockedEndings.filter((v) => v !== id),
                  }))
                }
              />
              {name}
            </label>
          ))}
        </section>
        <section className="admin-card">
          <h2>도감과 저장 관리</h2>
          <p>
            도감 등록과 천체 소환 해금은 별개입니다. 소환은 질량·환생 조건을
            따릅니다.
          </p>
          <div className="admin-codex">
            {bodies.map((b) => (
              <label className="admin-check" key={b.id}>
                <input
                  type="checkbox"
                  checked={!!state.codex[b.id]}
                  onChange={(e) =>
                    change((s) => ({
                      ...s,
                      codex: { ...s.codex, [b.id]: e.target.checked },
                      counts: {
                        ...s.counts,
                        [b.id]: e.target.checked ? s.counts[b.id] || 0 : 0,
                      },
                    }))
                  }
                />
                {b.name}
              </label>
            ))}
          </div>
          <div className="admin-actions">
            <button onClick={download}>현재 편집 상태 백업 ↓</button>
            <label className="admin-file">
              백업 불러오기 ↑
              <input
                type="file"
                accept=".json,application/json"
                onChange={importFile}
              />
            </label>
            <button
              disabled={!hasBackup}
              onClick={() =>
                setConfirmation({
                  text: "마지막 저장 직전의 게임 상태를 편집 화면으로 복원할까요?",
                  action: () =>
                    attempt(() => {
                      setState(parseAdminSave(localStorage.getItem(BACKUP)));
                      setDraft({});
                      setDirty(true);
                      setMessage(
                        "저장 전 상태를 불러왔습니다. 저장해야 게임에 반영됩니다.",
                      );
                    }),
                })
              }
            >
              저장 전 복원
            </button>
            <button
              className="admin-danger"
              onClick={() =>
                setConfirmation({
                  text: "편집 중인 진행과 엔딩 기록을 전부 초기화할까요? 저장 전까지 게임 기록은 유지됩니다.",
                  action: () => {
                    setState(fresh());
                    setDraft({});
                    setDirty(true);
                  },
                })
              }
            >
              새 우주 상태로 초기화
            </button>
          </div>
        </section>
      </div>
      <footer className="admin-savebar">
        <div role="status">
          <b>{dirty ? "● 저장하지 않은 변경 있음" : "● 편집 준비 완료"}</b>
          <p>{message}</p>
        </div>
        <button onClick={() => save()}>저장</button>
        <button className="admin-primary" onClick={() => save(true)}>
          저장하고 게임 실행 →
        </button>
      </footer>
      {confirmation && (
        <div className="admin-confirm-backdrop">
          <section
            className="admin-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-confirm-title"
          >
            <h2 id="admin-confirm-title">변경 확인</h2>
            <p>{confirmation.text}</p>
            <div className="admin-actions">
              <button autoFocus onClick={() => setConfirmation(null)}>
                취소
              </button>
              <button
                className="admin-primary"
                onClick={() => {
                  confirmation.action();
                  setConfirmation(null);
                }}
              >
                확인
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
