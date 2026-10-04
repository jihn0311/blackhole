import { Planet } from "./Planet.jsx";
import { SkillTree } from "./SkillTree.jsx";
import React, { useState } from "react";
import {
  baseDiscovered,
  baseBodies,
  prestigeBodies,
  fmt,
  holdUnlocked,
  permanentMass,
  permanentTime,
} from "./game.js";
import {
  rebirthTarget,
  canRebirth,
  rebirthReward,
  POINTS_PER_SHARD,
  deepeningUnlocked,
  deepeningCost,
} from "./prestige.js";
import { deepeningMultiplier } from "./skillData.js";
export function PrestigePanel({ state, onClose, onRebirth, onBuy }) {
  const [confirming, setConfirming] = useState(false);
  const reward = rebirthReward(state),
    ready = canRebirth(state),
    nextStar = prestigeBodies.find(
      (b) => b.rebirth === (state.rebirths || 0) + 1,
    );
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section
        className="modal prestige-modal"
        role="dialog"
        aria-modal="true"
        aria-label={confirming ? "환생 최종 확인" : "환생"}
        onClick={(e) => e.stopPropagation()}
      >
        <button autoFocus className="close" aria-label="닫기" onClick={onClose}>
          ×
        </button>
        <div className="eyebrow">BEYOND THE EVENT HORIZON</div>
        <h2>{confirming ? "새로운 우주로 떠날까요?" : "끝은 또 다른 시작"}</h2>
        <p className="modal-description">
          {state.rebirths || 0}회 환생 · 최고 질량{" "}
          {fmt(Math.max(state.bestMass || 0, state.mass))} M · 보유 특이점 조각{" "}
          {state.shards || 0}개
        </p>
        {confirming ? (
          <div className="rebirth-confirm">
            <div className="prestige-reward">
              <span>이번 환생으로 얻는 보상</span>
              <strong>
                ✦ +{reward}
                <small>특이점 조각</small>
              </strong>
              <p>
                {state.points} P ÷ {POINTS_PER_SHARD} → {reward}개 · 남는{" "}
                {state.points % POINTS_PER_SHARD} P는 초기화됩니다.
              </p>
            </div>
            <div className="reset-summary">
              <article>
                <h3>새로 시작</h3>
                <p>
                  질량과 레벨 · 일반 포인트 {state.points} P (새 회차 시작:{" "}
                  {state.permanentSkills?.seed ? 5 : 0} P) · 일반 업그레이드 ·
                  천체의 질량 해금 · 이번 회차 흡수 횟수 · 미션과 반복 탐사
                </p>
              </article>
              <article>
                <h3>그대로 유지</h3>
                <p>
                  발견한 도감 · 최고 기록 · 환생 횟수 · 특이점 조각과 영구 강화
                  {holdUnlocked(state) ? " · 영구 크리티컬 확률 1%" : ""}
                </p>
              </article>
            </div>
            {nextStar && (
              <p className="unlock-note">
                다음 회차에서 {nextStar.name} 탐사 가능 · {fmt(nextStar.unlock)}{" "}
                M 도달 후 소환
              </p>
            )}
            <div className="confirm-actions">
              <button onClick={() => setConfirming(false)}>돌아가기</button>
              <button
                className="prestige-primary"
                disabled={!ready}
                onClick={onRebirth}
              >
                초기화하고 환생하기 · +{reward}개
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="prestige-overview">
              <div>
                <div className="eyebrow">
                  NEXT CHAPTER · {(state.rebirths || 0) + 1}
                </div>
                <h3>기억을 남기고, 더 멀리.</h3>
                <p>
                  남은 일반 포인트를 특이점 조각으로 바꾸고 영구 보너스를
                  키우세요. 환생 후에는 기본 소행성부터 다시 시작합니다.
                </p>
                <div className="permanent-stats">
                  <span>영구 질량 ×{permanentMass(state).toFixed(2)}</span>
                  <span>
                    영구 대기시간 −
                    {Math.round((1 - permanentTime(state)) * 100)}%
                  </span>
                </div>
              </div>
              <div className="prestige-reward">
                <span>현재 포인트 기준 예상 보상</span>
                <strong>
                  ✦ {reward}
                  <small>특이점 조각</small>
                </strong>
                <p>
                  {state.points} P 보유 · {POINTS_PER_SHARD} P당 1개
                  <br />
                  {POINTS_PER_SHARD} P 미만의 나머지는 환생 시 소멸
                </p>
              </div>
            </div>
            <div className="rebirth-requirements">
              <div
                className={
                  baseDiscovered(state) === baseBodies.length ? "complete" : ""
                }
              >
                <span>기본 도감</span>
                <strong>
                  {baseDiscovered(state)} / {baseBodies.length}
                </strong>
              </div>
              <div
                className={state.mass >= rebirthTarget(state) ? "complete" : ""}
              >
                <span>이번 회차 질량</span>
                <strong>
                  {fmt(state.mass)} / {fmt(rebirthTarget(state))} M
                </strong>
              </div>
              <div
                className={state.points >= POINTS_PER_SHARD ? "complete" : ""}
              >
                <span>남은 일반 포인트</span>
                <strong>
                  {state.points} / {POINTS_PER_SHARD} P
                </strong>
              </div>
            </div>
            <button
              className="prestige-primary rebirth-start"
              disabled={!ready}
              onClick={() => setConfirming(true)}
            >
              {ready
                ? `환생 내용 확인 · 조각 ${reward}개`
                : "도감·질량·포인트 조건을 달성하면 환생할 수 있어요"}
            </button>
            <h3 className="section-title">새로운 천체의 문</h3>
            <div className="prestige-stars">
              {prestigeBodies.map((b, i) => (
                <article
                  key={b.id}
                  className={
                    (state.rebirths || 0) >= b.rebirth ? "available" : ""
                  }
                >
                  <Planet body={b} />
                  <div>
                    <strong>{b.name}</strong>
                    <p>
                      {b.rebirth}회 환생 + {fmt(b.unlock)} M
                    </p>
                    <small>
                      {(state.rebirths || 0) >= b.rebirth
                        ? "탐사 가능 · 질량 조건 달성 후 생성"
                        : "환생으로 탐사 해금"}
                    </small>
                  </div>
                </article>
              ))}
            </div>
            <h3 className="section-title">
              특이점 조각으로 영구 강화{" "}
              <small>보유 {state.shards || 0}개</small>
            </h3>
            <SkillTree state={state} permanent onBuy={onBuy} />
            <div className="singularity-deepening">
              <h3>특이점 심화 · {state.singularityDepth || 0}단계</h3>
              <p>
                영구 스킬 10개를 모두 습득하면 반복 강화가 열립니다. 단계마다
                흡수 질량 보너스 +10%p, 비용은 2배씩 증가합니다. 환생해도
                유지됩니다.
              </p>
              <p>
                심화 배율 ×{deepeningMultiplier(state).toFixed(2)} → ×
                {(deepeningMultiplier(state) + 0.1).toFixed(2)} · 다른 질량
                보너스와 곱연산
              </p>
              <button
                className={
                  state.shards < deepeningCost(state) ? "unaffordable-text" : ""
                }
                disabled={
                  !deepeningUnlocked(state) ||
                  state.shards < deepeningCost(state)
                }
                onClick={() => onBuy("deepening")}
              >
                {deepeningUnlocked(state)
                  ? deepeningCost(state).toLocaleString() + " 조각 · 심화 강화"
                  : "영구 스킬 10개 습득 필요"}
              </button>
            </div>
            <p className="fine">
              환생해도 발견한 도감과 영구 강화는 남습니다. 치명적 흡수 10단계를
              한 번 해금하면 영구 크리티컬 확률 1%도 유지됩니다.
            </p>
          </>
        )}
      </section>
    </div>
  );
}
