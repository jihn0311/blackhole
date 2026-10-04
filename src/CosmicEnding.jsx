import { DigitalCorruption } from "./DigitalCorruption.jsx";
import { SurvivorEscape, SurvivorCredits } from "./SurvivorEnding.jsx";
import { HackingEnding, HackingCredits } from "./HackingEnding.jsx";
import { FinalShatter } from "./FinalShatter.jsx";
import { installCreditsAcceleration } from "./creditsControls.js";
import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { collapseStage, endingReached, collapseMessages } from "./collapse.js";
import "./CosmicEnding.css";
export function CosmicEnding({
  level,
  onComplete,
  replay = false,
  variant = "normal",
  onCreditsStart,
  onCorruptionBurst,
}) {
  const [previewLevel, setPreviewLevel] = useState(
    replay && variant === "hacking" ? 300 : 400,
  );
  useEffect(() => {
    if (!replay || variant !== "hacking") return;
    const timer = setInterval(
      () => setPreviewLevel((current) => Math.min(400, current + 10)),
      600,
    );
    return () => clearInterval(timer);
  }, [replay, variant]);
  const effectLevel = replay ? previewLevel : level;
  const stage = collapseStage(effectLevel),
    ended = endingReached(effectLevel);
  const focusRef = useRef(null),
    rollRef = useRef(null);
  const [fast, setFast] = useState(false);
  const [shattered, setShattered] = useState(false);
  const creditsReady = ended && shattered;
  useEffect(() => {
    if (!ended) {
      setShattered(false);
      return;
    }
    const timer = setTimeout(
      () => setShattered(true),
      variant === "survivor" ? 60000 : 6500,
    );
    return () => clearTimeout(timer);
  }, [ended, replay, variant]);
  useEffect(() => {
    setFast(false);
    if (!creditsReady || !rollRef.current) return;
    return installCreditsAcceleration(rollRef.current, setFast);
  }, [creditsReady]);
  useEffect(() => {
    if (creditsReady) {
      focusRef.current?.focus();
      onCreditsStart?.();
    }
  }, [creditsReady]);
  useEffect(() => {
    if (!ended) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [ended]);
  if (!stage) return null;
  return createPortal(
    ended && !creditsReady ? (
      variant === "survivor" ? (
        <SurvivorEscape />
      ) : variant === "hacking" ? (
        <HackingEnding />
      ) : (
        <FinalShatter />
      )
    ) : creditsReady ? (
      <section
        className="cosmic-ending"
        role="dialog"
        aria-modal="true"
        aria-label="엔딩 크레딧"
        onKeyDown={(e) => {
          if (e.key === "Tab") {
            const buttons = [
              ...e.currentTarget.querySelectorAll("button:not(:disabled)"),
            ];
            const first = buttons[0],
              last = buttons.at(-1);
            if (e.shiftKey && document.activeElement === first) {
              e.preventDefault();
              last?.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault();
              first?.focus();
            }
          }
        }}
      >
        {
          <>
            <button
              ref={focusRef}
              className="credits-skip"
              onClick={onComplete}
            >
              크레딧 건너뛰기
            </button>
            <div className="credits-speed-hint">
              {fast ? "▶▶ 4배속" : "SPACE 누르고 있기 · 4배속"}
            </div>
            <div
              ref={rollRef}
              className="credits-roll"
              onAnimationEnd={onComplete}
            >
              {variant === "survivor" ? (
                <SurvivorCredits />
              ) : variant === "hacking" ? (
                <HackingCredits />
              ) : (
                <>
                  <p className="credits-eyebrow">
                    LEVEL 400 · THE LAST HORIZON
                  </p>
                  <h1>
                    EVENT
                    <br />
                    HORIZON
                  </h1>
                  <p className="credits-subtitle">마지막 빛이 사라진 자리</p>
                  <div className="credits-chapter">
                    <p>처음에는 작은 소행성 하나였습니다.</p>
                    <p>
                      행성을 지나 별을 삼키고,
                      <br />
                      다시 태어나 더 먼 우주로 나아갔습니다.
                    </p>
                  </div>
                  <div className="credits-chapter">
                    <span>THE OBSERVER</span>
                    <h2>관측자</h2>
                    <p>끝까지 우주를 바라본 당신</p>
                  </div>
                  <div className="credits-chapter">
                    <span>THE JOURNEY</span>
                    <h2>발견 · 성장 · 환생</h2>
                    <p>
                      열다섯 개의 천체
                      <br />
                      여든 개의 성장
                      <br />
                      그리고 네 번의 백 번째 지평선
                    </p>
                  </div>
                  <div className="credits-chapter">
                    <span>CREATED TOGETHER</span>
                    <h2>기획과 우주</h2>
                    <p>당신의 상상</p>
                    <h2>개발</h2>
                    <p>codex와 j</p>
                  </div>
                  <div className="credits-chapter">
                    <span>SPECIAL THANKS</span>
                    <h2>이 우주에 머물러 준 당신에게</h2>
                    <p>
                      모든 빛이 사라져도
                      <br />
                      당신이 남긴 발견은 사라지지 않습니다.
                    </p>
                  </div>
                  <div className="credits-chapter credits-last">
                    <h2>관측을 마칩니다.</h2>
                    <p>THANK YOU FOR PLAYING</p>
                    <span>끝은 또 다른 시작.</span>
                  </div>
                </>
              )}
            </div>
          </>
        }
      </section>
    ) : variant === "hacking" ? (
      <DigitalCorruption stage={stage} onBurst={onCorruptionBurst} />
    ) : (
      <div
        className={`cosmic-collapse collapse-${stage}`}
        style={{ "--fracture": stage / 2 }}
        key={stage}
        aria-hidden="true"
      >
        <div className="collapse-grain" />
        <div className="collapse-vignette" />
        <svg
          className="collapse-cracks"
          viewBox="0 0 1600 1000"
          preserveAspectRatio="none"
        >
          <path d="M0 140L340 186 482 116 610 284 940 344 1010 620 1340 712 1600 690 M610 284L566 420 690 506 M940 344L1080 245 1370 276 1600 220" />
          {stage >= 2 && (
            <path d="M1600 30L1240 148 1020 93 870 240 590 205 388 374 0 345 M870 240L820 510 660 700 722 1000" />
          )}
          {stage >= 3 && (
            <path d="M0 820L244 742 380 808 590 610 902 648 1056 504 1246 533 1600 400 M380 808L420 1000 M1056 504L1160 352" />
          )}
          {stage >= 4 && (
            <path d="M100 0L194 240 104 386 240 680 560 762 822 690 1120 855 1600 940 M240 680L0 590 M1120 855L1080 1000" />
          )}
          {stage >= 5 && (
            <path d="M800 0L730 130 900 344 780 460 930 722 870 1000 M0 500L590 610 390 460 800 480 1280 690 1600 610" />
          )}
        </svg>
        {Array.from({ length: stage * 2 }, (_, i) => (
          <div
            className="collapse-tear"
            key={i}
            style={{
              top: `${(i * 23 + 13) % 97}%`,
              height: `${2 + stage * ((i % 3) + 1)}px`,
              animationDelay: `-${i * 0.73}s`,
            }}
          />
        ))}
        <div className="collapse-readout">
          <span>REALITY INTEGRITY · {Math.max(0, 100 - stage * 9)}%</span>
          <strong>{collapseMessages[stage]}</strong>
          <small>
            LV {level} / 400 · SIGNAL LOST
            {stage >= 4 ? " // RECONNECTION FAILED" : ""}
          </small>
        </div>
        {stage >= 4 && (
          <div className="collapse-fragment">
            NO SIGNAL
            <br />
            UNIVERSE_NOT_FOUND
          </div>
        )}
      </div>
    ),
    document.body,
  );
}
