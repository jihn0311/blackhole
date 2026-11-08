import React from "react";
export function ContentEditor({ config, onChange }) {
  const planetFields = [
    ["name", "이름", "text"],
    ["mass", "흡수 질량", "number"],
    ["unlock", "해금 질량", "number"],
    ["cooldown", "쿨타임(초)", "number"],
    ["rebirth", "필요 환생 횟수", "number"],
    ["size", "크기 (6~40)", "number"],
    ["color", "색상", "color"],
    ["fact", "도감 설명", "textarea"],
  ];
  const endingFields = [
    ["name", "엔딩 이름", "text"],
    ["hint", "해금 힌트", "text"],
    ["level", "필요 레벨", "number"],
    ["rebirths", "필요 환생 횟수", "number"],
    ["text", "크레딧 문구 (줄바꿈 가능)", "textarea"],
  ];
  const edit = (key, index, field, value) =>
    onChange(
      key,
      (config[key] || []).map((p, i) =>
        i === index ? { ...p, [field]: value } : p,
      ),
    );
  const remove = (key, index) => {
    if (
      window.confirm(
        "이 항목을 편집 목록에서 삭제할까요? 배포 전까지 공개 게임은 바뀌지 않습니다.",
      )
    )
      onChange(
        key,
        config[key].filter((_, i) => i !== index),
      );
  };
  const form = (key, p, i, fields) => (
    <article className="admin-scene" key={p.id}>
      <h3>
        {i + 1}. {p.name}
      </h3>
      <small>고유 ID: {p.id}</small>
      {fields.map(([field, label, type]) => (
        <label className="admin-setting" key={field}>
          {label}
          {type === "textarea" ? (
            <textarea
              value={p[field]}
              onChange={(e) => edit(key, i, field, e.target.value)}
            />
          ) : (
            <input
              type={type}
              step="any"
              value={p[field]}
              onChange={(e) =>
                edit(
                  key,
                  i,
                  field,
                  type === "number"
                    ? e.target.value === ""
                      ? ""
                      : Number(e.target.value)
                    : e.target.value,
                )
              }
            />
          )}
        </label>
      ))}
      {key === "customEndings" && (
        <label className="admin-setting">
          연출·음악
          <select
            value={p.style}
            onChange={(e) => edit(key, i, "style", e.target.value)}
          >
            <option value="normal">유리 붕괴 · 쓸쓸한 음악</option>
            <option value="hacking">숫자 변환 · 변환자 음악</option>
            <option value="survivor">우주에서 멀어지기 · 생존자 음악</option>
            <option value="happy">빛으로 탈출 · 최종 엔딩 음악</option>
          </select>
        </label>
      )}
      <button onClick={() => remove(key, i)}>이 항목 삭제</button>
    </article>
  );
  return (
    <div className="admin-grid">
      <section className="admin-card">
        <h2>새 천체 추가</h2>
        <p>
          색상과 크기로 천체를 만들고, 소환 목록과 도감에 추가합니다. 추가
          천체는 목록 마지막에 표시되며 버튼으로 소환할 수 있습니다.
        </p>
        <button
          disabled={(config.customPlanets || []).length >= 30}
          onClick={() =>
            onChange("customPlanets", [
              ...(config.customPlanets || []),
              {
                id: "custom_" + crypto.randomUUID().replaceAll("-", ""),
                name: "새 행성",
                mass: 1000,
                unlock: 10000,
                cooldown: 5,
                rebirth: 0,
                size: 15,
                color: "#87deea",
                fact: "새롭게 발견한 천체입니다.",
              },
            ])
          }
        >
          + 천체 추가
        </button>
        {(config.customPlanets || []).map((p, i) =>
          form("customPlanets", p, i, planetFields),
        )}
      </section>
      <section className="admin-card">
        <h2>새 엔딩 추가</h2>
        <p>
          조건을 달성하면 엔딩 종류 창에서 직접 실행합니다. 기존 400레벨 엔딩을
          대체하지 않습니다. 연출·음악은 기존 4종 중 선택하고 크레딧은 직접
          작성합니다.
        </p>
        <button
          disabled={(config.customEndings || []).length >= 20}
          onClick={() =>
            onChange("customEndings", [
              ...(config.customEndings || []),
              {
                id: "custom_" + crypto.randomUUID().replaceAll("-", ""),
                name: "새로운 결말",
                hint: "새로운 우주를 탐험하세요.",
                text: "당신의 이야기는 여기서 끝나지 않습니다.\n다음 우주에서 다시 만나요.",
                level: 10,
                rebirths: 0,
                style: "happy",
              },
            ])
          }
        >
          + 엔딩 추가
        </button>
        {(config.customEndings || []).map((p, i) =>
          form("customEndings", p, i, endingFields),
        )}
      </section>
    </div>
  );
}
