import { survivorEligible } from "./survivorEligibility.js";
import { AchievementToast } from "./AchievementToast.jsx";
import { CosmicEnding } from "./CosmicEnding.jsx";
import { collapseStage, endingReached } from "./collapse.js";
import { bulkUpgrade } from "./bulkUpgrade.js";
import { Planet } from "./Planet.jsx";
import { drawInfallBody, advanceInfall } from "./infall.js";
import { SkillTree } from "./SkillTree.jsx";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { createRoot } from "react-dom/client";
import {
  bodies,
  upgrades,
  fresh,
  level,
  levelProgress,
  fmtExact,
  total,
  discovered,
  missions,
  absorb,
  buy,
  claim,
  cooldown,
  reserve,
  SAVE_KEY,
  load,
  fmt,
  upgradeCost,
  levelReward,
  fullyUpgraded,
  codexComplete,
  massGain,
  autoCandidates,
  autoUnlocked,
  autoStage,
  upgradeCount,
  shortcuts,
  spawnCount,
  isCritical,
  criticalChance,
  extraSpawnChance,
  blackHoleScale,
  missionReward,
  expeditionTarget,
  expeditionReward,
  SAVE_VERSION,
  isUnlocked,
  hasDiscovered,
  baseDiscovered,
} from "./game.js";
import { useSpawnControls } from "./useSpawnControls.js";
import "./style.css";
import blackHoleUrl from "./assets/black-hole.gif";
import { createSoundEngine } from "./audio.js";
import { PrestigePanel } from "./PrestigePanel.jsx";
import {
  rebirth,
  buyPermanent,
  canRebirth,
  prestigeUnlocked,
} from "./prestige.js";

function Universe({ state, onAbsorb, queue, paused, controls }) {
  const ref = useRef(),
    imageRef = useRef(),
    live = useRef();
  live.current = { state, onAbsorb, paused };
  useEffect(() => {
    const canvas = ref.current,
      ctx = canvas.getContext("2d");
    let w = 0,
      h = 0,
      frame,
      last = 0,
      t = 0,
      particles = [],
      sparks = [];
    const stars = Array.from({ length: 260 }, () => [
      Math.random(),
      Math.random(),
      Math.random() * 1.4 + 0.2,
      Math.random() * 6,
    ]);
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      const d = Math.min(devicePixelRatio, 2);
      canvas.width = w * d;
      canvas.height = h * d;
      ctx.setTransform(d, 0, 0, d, 0, 0);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    function draw(now) {
      const dt = Math.min((now - last) / 1000, 0.04) || 0;
      last = now;
      const current = live.current;
      if (!current.paused) t += dt;
      const cx = w * 0.5,
        cy = h * 0.47;
      const imageWidth =
        Math.min(w * 0.94, h * 1.48) *
        blackHoleScale(level(current.state.mass));
      const imageHeight = (imageWidth * 600) / 1040;
      const r = imageWidth * 0.1;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#080b12";
      ctx.fillRect(0, 0, w, h);
      for (const [x, y, s, p] of stars) {
        ctx.fillStyle = `rgba(200,216,242,${0.15 + (Math.sin(t * 0.5 + p) + 1) * 0.25})`;
        ctx.beginPath();
        ctx.arc(x * w, y * h, s, 0, Math.PI * 2);
        ctx.fill();
      }
      if (fullyUpgraded(current.state) || codexComplete(current.state)) {
        const glowRadius = Math.min(w, h) * (0.34 + Math.sin(t * 1.4) * 0.015);
        const glow = ctx.createRadialGradient(cx, cy, r, cx, cy, glowRadius);
        glow.addColorStop(
          0,
          codexComplete(current.state)
            ? "rgba(90,220,240,.28)"
            : "rgba(165,90,255,.3)",
        );
        glow.addColorStop(1, "rgba(100,60,180,0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(cx, cy, glowRadius, 0, Math.PI * 2);
        ctx.fill();
      }
      const halo = ctx.createRadialGradient(
        cx,
        cy,
        r * 0.6,
        cx,
        cy,
        imageWidth * 0.5,
      );
      const skyMastery =
        fullyUpgraded(current.state) &&
        bodies.every((body) => isUnlocked(current.state, body));
      halo.addColorStop(0, skyMastery ? "#87cefa40" : "#f45d2025");
      halo.addColorStop(1, "#00000000");
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, w, h);
      // The supplied bitmap is kept unchanged. Screen blending lets its black
      // background merge into space; an opaque core hides stars behind the hole.
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      // Use a native image layer: canvas drawImage freezes animated GIFs.
      const image = imageRef.current;
      if (image) {
        image.style.width = imageWidth + "px";
        image.style.left = cx - imageWidth * 0.5 + "px";
        image.style.top = cy - imageHeight * 0.51 + "px";
      }
      if (!current.paused) {
        for (const item of queue.current.splice(0)) {
          particles.push({ ...item, x: item.x * w, y: item.y * h, life: 0 });
        }
        for (const p of particles) {
          p.life += dt;
          if (advanceInfall(p, cx, cy, r, dt)) {
            p.done = true;
            const gained = current.onAbsorb(p.id);
            sparks.push({
              x: cx + (sparks.length % 3 - 1) * 65,
              y: cy + r + 40 + (sparks.length % 2) * 24,
              life: 0,
              text:
                (gained.critical ? "CRITICAL ×10 · +" : "+") +
                fmt(gained.mass) +
                " M",
              critical: gained.critical,
            });
          }
        }
      }
      particles = particles.filter((p) => !p.done);
      sparks = sparks.slice(-12);
      for (const p of particles) {
        const b = bodies.find((b) => b.id === p.id);
        drawInfallBody(ctx, b, p, cx, cy, r);
      }
      for (const s of sparks) {
        if (!current.paused) s.life += dt;
        ctx.globalAlpha = Math.max(0, 1 - s.life / 1.8);
        ctx.fillStyle = s.critical ? "#ff7b9e" : "#f5c392";
        ctx.font = `bold ${s.critical ? 26 : 21}px monospace`;
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#080b12";
        ctx.textAlign = "center";
        ctx.strokeText(s.text, s.x, s.y - s.life * 24);
        ctx.fillText(s.text, s.x, s.y - s.life * 24);
      }
      ctx.globalAlpha = 1;
      sparks = sparks.filter((s) => s.life < 1.8);
      frame = requestAnimationFrame(draw);
    }
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);
  return (
    <>
      <canvas
        ref={ref}
        className="universe"
        aria-label="우주 공간: 클릭 또는 천체 단축키로 가장자리에 소환"
        tabIndex={0}
        {...controls}
      />
      <img
        ref={imageRef}
        className="black-hole-animation"
        src={blackHoleUrl}
        alt=""
        aria-hidden="true"
        draggable={false}
      />
    </>
  );
}

function MassNumber({ value }) {
  const element = useRef(null);
  const previous = useRef(value);
  const pulse = useRef(null);
  useEffect(() => {
    const increased = value > previous.current;
    previous.current = value;
    if (!increased) {
      pulse.current?.cancel();
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Let each pulse return to normal even during rapid automatic absorption.
    if (pulse.current?.playState === "running") return;
    pulse.current = element.current.animate(
      [{ transform: "scale(1)" }, { transform: "scale(1.12)", offset: 0.3 }, { transform: "scale(1)" }],
      { duration: 300, easing: "ease-out" },
    );
  }, [value]);
  useEffect(() => () => pulse.current?.cancel(), []);
  return <span ref={element} className="growing-number">{fmt(value)}</span>;
}

function App() {
  const [state, setState] = useState(load),
    [selected, setSelected] = useState("asteroid"),
    [tab, setTab] = useState("play"),
    [now, setNow] = useState(Date.now()),
    [toast, setToast] = useState(""),
    [paused, setPaused] = useState(false),
    [resetOpen, setResetOpen] = useState(false),
    [saveError, setSaveError] = useState(false),
    [generation, setGeneration] = useState(0);
  const [achievementVisible, setAchievementVisible] = useState(false);
  const dismissAchievement = useCallback(
    () => setAchievementVisible(false),
    [],
  );
  const autoSchedule = useRef({ lastAt: -Infinity });
  const audioRef = useRef();
  if (!audioRef.current) {
    let storage;
    try {
      storage = window.localStorage;
    } catch {}
    audioRef.current = createSoundEngine({
      storage,
      hidden: () => document.hidden,
    });
  }
  const [soundEnabled, setSoundEnabled] = useState(
    () => audioRef.current.enabled,
  );
  useEffect(() => {
    const unlock = () => audioRef.current.unlock();
    window.addEventListener("pointerdown", unlock, true);
    window.addEventListener("keydown", unlock, true);
    return () => {
      window.removeEventListener("pointerdown", unlock, true);
      window.removeEventListener("keydown", unlock, true);
      audioRef.current.dispose();
    };
  }, []);
  const live = useRef(state),
    queue = useRef([]),
    toastTimer = useRef();
  live.current = state;
  useEffect(() => {
    if (tab !== "codex") return;
    let code = "",
      lastKeyAt = 0;
    const onCode = (event) => {
      if (
        event.repeat ||
        event.isComposing ||
        event.ctrlKey ||
        event.altKey ||
        event.metaKey
      )
        return;
      if (
        event.target instanceof Element &&
        event.target.closest('input, textarea, [contenteditable="true"]')
      )
        return;
      if (event.key.length !== 1) {
        code = "";
        return;
      }
      const now = Date.now();
      if (now - lastKeyAt > 2000) code = "";
      lastKeyAt = now;
      code = (code + event.key.toLowerCase()).slice(-3);
      if (code !== "jis") return;
      code = "";
      update((current) => ({
        ...current,
        cheatUsed: true,
        rebirths: Math.max(3, current.rebirths || 0),
        shards: (current.shards || 0) + 10000000,
        points: (current.points || 0) + 10000,
      }));
      notify(
        "치트 적용 · 환생 최소 3회 · 특이점 조각 +10,000,000 · 업그레이드 포인트 +10,000",
      );
      audioRef.current.playUnlock();
    };
    window.addEventListener("keydown", onCode);
    return () => window.removeEventListener("keydown", onCode);
  }, [tab]);
  const overdrive = fullyUpgraded(state);
  const purchasedUpgrades = upgradeCount(state);
  const previousUpgradeCount = useRef(purchasedUpgrades);
  useEffect(() => {
    // The full-tree celebration below owns the sound when bulk buying all 80.
    if (previousUpgradeCount.current === 0 && purchasedUpgrades > 0 && !overdrive)
      audioRef.current.playFirstUpgrade();
    previousUpgradeCount.current = purchasedUpgrades;
  }, [purchasedUpgrades, overdrive]);
  const wasOverdrive = useRef(overdrive);
  useEffect(() => {
    if (overdrive && !wasOverdrive.current) {
      notify(
        "80개 풀강 완료! 특이점 폭주 · 질량 ×10 · 생성 속도 ×2 · 레벨 보상 ×3",
      );
      audioRef.current.playRebirth();
    }
    wasOverdrive.current = overdrive;
  }, [overdrive]);
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [newBodies, setNewBodies] = useState([]);
  const lastUnlocked = useRef(bodies.filter((b) => isUnlocked(state, b)).map((b) => b.id));
  useEffect(() => {
    const ids = bodies.filter((b) => isUnlocked(state, b)).map((b) => b.id);
    const added = ids.filter((id) => !lastUnlocked.current.includes(id));
    if (added.length || ids.length < lastUnlocked.current.length)
      setNewBodies((old) => [...new Set([...old.filter((id) => ids.includes(id)), ...added])]);
    lastUnlocked.current = ids;
  }, [state.mass, state.rebirths]);
  useEffect(() => { setNewBodies([]); }, [generation]);
  const unlockedCount = bodies.filter((body) => isUnlocked(state, body)).length;
  const previousUnlockedCount = useRef(unlockedCount);
  useEffect(() => {
    if (unlockedCount > previousUnlockedCount.current)
      audioRef.current.playUnlock();
    previousUnlockedCount.current = unlockedCount;
  }, [unlockedCount]);
  const progress = levelProgress(state.mass);
  const [creditsReplay, setCreditsReplay] = useState(false);
  const [replayVariant, setReplayVariant] = useState("normal");
  const [endingRestartOpen, setEndingRestartOpen] = useState(false);
  const [endingRestartConfirmed, setEndingRestartConfirmed] = useState(false);
  function closeEndings() {
    if (endingRestartConfirmed) setTab("play");
    else setEndingRestartOpen(true);
  }
  const unlockedEndings = [
    ...new Set([
      ...(state.unlockedEndings || []),
      ...(state.endingSeen ? [state.endingType || "normal"] : []),
    ]),
  ];
  const endingsAvailable = unlockedEndings.length > 0;
  const [survivorEnding, setSurvivorEnding] = useState(false);
  const canSurvive = survivorEligible(state);
  useEffect(() => {
    if (!canSurvive || survivorEnding || creditsReplay) return;
    const timer = setTimeout(() => {
      if (!survivorEligible(live.current)) return;
      setSurvivorEnding(true);
      setTab("play");
    }, 120000);
    return () => clearTimeout(timer);
  }, [canSurvive, generation, survivorEnding, creditsReplay]);
  const ended =
    survivorEnding ||
    creditsReplay ||
    (!state.endingSeen && endingReached(progress.level));
  useEffect(() => {
    audioRef.current.setCollapse(
      state.endingSeen || ended ? 0 : collapseStage(progress.level),
    );
  }, [state.endingSeen, ended, progress.level]);
  useEffect(() => {
    if (ended) {
      audioRef.current.playCredits(
        creditsReplay
          ? replayVariant
          : survivorEnding
            ? "survivor"
            : state.cheatUsed
              ? "hacking"
              : "normal",
      );
      if (!creditsReplay && !survivorEnding) audioRef.current.fadeShatter();
    } else audioRef.current.stopCredits();
    return () => {
      audioRef.current.stopCredits();
      audioRef.current.restoreVolume();
    };
  }, [ended, creditsReplay, replayVariant, survivorEnding, state.cheatUsed]);
  const lv = progress.level,
    catalog = discovered(state),
    mission = missions[state.mission],
    nextBody = bodies.find((b) => !isUnlocked(state, b));
  const readyMission = mission && mission.value(state) >= mission.target ? state.mission : null;
  const lastReadyMission = useRef(readyMission);
  useEffect(() => {
    if (readyMission !== null && readyMission !== lastReadyMission.current)
      audioRef.current.playMission();
    lastReadyMission.current = readyMission;
  }, [readyMission]);
  useEffect(() => {
    if (ended || (tab === "play" && !resetOpen && !endingRestartOpen)) return;
    const trap = (e) => {
      if (e.key !== "Tab") return;
      const dialog = document.querySelectorAll('[role="dialog"]');
      const active = dialog[dialog.length - 1];
      if (!active) return;
      const notice = document.querySelector(".prestige-unlock-notice");
      const items = [
        ...active.querySelectorAll(
          'button:not(:disabled),a[href],input:not(:disabled),[tabindex="0"]',
        ),
        ...(notice?.querySelectorAll("button") || []),
      ];
      if (!items.length) return;
      const first = items[0],
        last = items[items.length - 1];
      if (
        !active.contains(document.activeElement) &&
        !notice?.contains(document.activeElement)
      ) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", trap);
    return () => document.removeEventListener("keydown", trap);
  }, [tab, resetOpen, ended, endingRestartOpen]);
  const update = (fn) => {
    const n = fn(live.current);
    live.current = n;
    setState(n);
    return n;
  };
  function notify(message) {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 3200);
  }
  function openPrestige() {
    if (!prestigeUnlocked(live.current)) {
      notify("모든 업그레이드 해금시 열림");
      return;
    }
    setTab("prestige");
  }
  function spawn(id, x, y, auto = false, quiet = false) {
    if (
      ended ||
      paused ||
      (tab !== "play" && tab !== "upgrades") ||
      resetOpen
    ) {
      if (!auto && !quiet)
        notify("일시정지를 해제하면 천체를 생성할 수 있어요.");
      return;
    }
    const prev = live.current,
      n = reserve(prev, id, Date.now(), auto);
    if (n === prev) {
      if (!auto && !quiet) notify("천체가 준비될 때까지 잠시 기다려 주세요.");
      return;
    }
    if (queue.current.length > 40) return;
    update(() => n);
    const copies = spawnCount(prev, Math.random());
    for (let i = 0; i < copies; i++)
      queue.current.push({
        id,
        x: Math.min(0.95, x + i * 0.035),
        y: Math.min(0.95, y + i * 0.025),
      });
    audioRef.current.playSpawn();
  }
  const controls = useSpawnControls({
    state,
    selected,
    enabled:
      !ended && !paused && (tab === "play" || tab === "upgrades") && !resetOpen,
    allowHold: false,
    onSelect: setSelected,
    onSpawn: spawn,
    notify,
  });
  function onAbsorb(id) {
    if (creditsReplay || survivorEnding) return { mass: 0, critical: false };
    if (!live.current.endingSeen && endingReached(level(live.current.mass)))
      return { mass: 0, critical: false };
    const before = live.current,
      roll = Math.random(),
      critical = isCritical(before, roll),
      n = update((s) => absorb(s, id, roll));
    audioRef.current.playAbsorb();
    if (level(n.mass) > level(before.mass)) audioRef.current.playLevelUp();
    if (discovered(n) === bodies.length && discovered(before) < bodies.length) {
      notify("우주 통달! 영구 질량 ×20 · 포인트 보상 ×3 · 쿨타임 40% 감소");
      audioRef.current.playRebirth();
    } else if (baseDiscovered(n) === 12 && baseDiscovered(before) < 12)
      notify("기본 도감 완성! 일반 업그레이드 80개를 완료하면 환생이 열려요.");
    else if (level(n.mass) > level(before.mass))
      notify(
        `LEVEL ${level(n.mass)} · 업그레이드 포인트 +${n.points - before.points}`,
      );
    else if (!hasDiscovered(before, id))
      notify(
        `${bodies.find((b) => b.id === id).name} · 도감에 새롭게 기록했어요.`,
      );
    return { mass: n.mass - before.mass, critical };
  }
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (ended || paused || (tab !== "play" && tab !== "upgrades") || resetOpen)
      return;
    const available = autoCandidates(live.current, now, autoSchedule.current);
    if (
      autoStage(live.current) === 1 &&
      now - autoSchedule.current.lastAt >= 1000
    ) {
      autoSchedule.current = { lastAt: now };
    }
    for (const b of available) {
      spawn(
        b.id,
        0.15 + Math.random() * 0.7,
        Math.random() < 0.5 ? 0.12 : 0.85,
        true,
      );
    }
  }, [now]);
  useEffect(() => {
    try {
      localStorage.setItem(
        SAVE_KEY,
        JSON.stringify({ version: SAVE_VERSION, state }),
      );
      setSaveError(false);
    } catch {
      setSaveError(true);
    }
  }, [state]);
  useEffect(() => () => clearTimeout(toastTimer.current), []);
  useEffect(() => {
    const close = (e) => {
      if (e.key === "Escape") {
        if (tab === "endings") {
          closeEndings();
          return;
        }
        setResetOpen(false);
        setTab("play");
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [tab, endingRestartConfirmed]);
  return (
    <div
      className="app"
      data-collapse={
        state.endingSeen || state.cheatUsed ? 0 : collapseStage(lv)
      }
      style={{
        "--glitch": state.endingSeen ? 0 : Math.min(10, collapseStage(lv)),
      }}
      inert={ended ? true : undefined}
    >
      {(!state.endingSeen || creditsReplay) && (
        <CosmicEnding
          key={creditsReplay ? `replay-${replayVariant}` : "live-ending"}
          level={creditsReplay || survivorEnding ? 400 : lv}
          replay={creditsReplay}
          variant={
            creditsReplay
              ? replayVariant
              : survivorEnding
                ? "survivor"
                : state.cheatUsed
                  ? "hacking"
                  : "normal"
          }
          onCreditsStart={() => audioRef.current.restoreVolume()}
          onCorruptionBurst={() => audioRef.current.playCorruptionBurst()}
          onComplete={() => {
            const firstEnding = !creditsReplay && !state.endingSeen;
            setCreditsReplay(false);
            setSurvivorEnding(false);
            if (!creditsReplay)
              update((s) => {
                const kind = survivorEnding
                  ? "survivor"
                  : s.cheatUsed
                    ? "hacking"
                    : "normal";
                return {
                  ...s,
                  endingSeen: true,
                  endingType: kind,
                  unlockedEndings: [
                    ...new Set([...(s.unlockedEndings || []), kind]),
                  ],
                };
              });
            setTab("play");
            setResetOpen(false);
            setPaused(false);
            setToast("");
            if (firstEnding) {
              if (!state.cheatUsed && !survivorEnding)
                setAchievementVisible(true);
              audioRef.current.playRebirth();
            }
          }}
        />
      )}
      <header>
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setTab("play");
          }}
        >
          <span className="brand-mark">◉</span>
          <span>
            EVENT HORIZON<small>블랙홀 키우기</small>
          </span>
        </a>
        <nav aria-label="메인 메뉴">
          {[
            ["play", "관측소"],
            ["upgrades", "업그레이드"],
            ["codex", "천체 도감"],
            ["prestige", "환생"],
          ].map(([id, label]) => (
            <button
              key={id}
              className={tab === id ? "active" : ""}
              onClick={() => (id === "prestige" ? openPrestige() : setTab(id))}
              aria-label={
                id === "prestige" && !prestigeUnlocked(state)
                  ? "환생 잠김"
                  : undefined
              }
            >
              {id === "prestige" && !prestigeUnlocked(state) ? "🔒" : label}
              {id === "upgrades" && state.points > 0 && <i>{state.points}</i>}
              {id === "prestige" && canRebirth(state) && <i>✦</i>}
              {id === "codex" && (
                <span className="nav-count">
                  {catalog}/{bodies.length}
                </span>
              )}
            </button>
          ))}
          <button
            aria-label={endingsAvailable ? "엔딩 종류" : "엔딩 종류 잠김"}
            title={
              endingsAvailable
                ? "엔딩 종류"
                : "해금조건\n행성 15개 해금\n400LV\n업그레이드 모두 해금"
            }
            onClick={() => {
              if (!endingsAvailable) {
                notify("엔딩 크레딧 감상 후 열림");
                return;
              }
              audioRef.current.unlock();
              setEndingRestartConfirmed(false);
              setTab("endings");
            }}
          >
            {endingsAvailable ? "엔딩 종류" : "🔒"}
          </button>
        </nav>
        <div className="header-status">
          <span className="status-dot" />
          {saveError ? "저장 공간 확인 필요" : "자동 저장 중"}
          <button
            className="icon-button"
            title="게임 초기화"
            aria-label="게임 초기화"
            onClick={() => setResetOpen(true)}
          >
            ↺
          </button>
        </div>
      </header>
      <main className={`game-layout ${leftCollapsed ? "left-collapsed" : ""} ${rightCollapsed ? "right-collapsed" : ""}`}>
        <div className="panel-dock dock-left">
          <button className="panel-toggle" aria-label={leftCollapsed ? "질량·미션 펼치기" : "질량·미션 접기"} aria-expanded={!leftCollapsed} aria-controls="report-panel" onClick={() => setLeftCollapsed((v) => !v)}>
            {leftCollapsed ? "❯" : "❮"}
            {mission && mission.value(state) >= mission.target && <span className="notification-dot" role="img" aria-label="미션 보상 수령 가능" />}
          </button>
        <aside id="report-panel" className="left-panel" inert={leftCollapsed}>
          <div className="eyebrow">
            SINGULARITY REPORT <span>01</span>
          </div>
          <h1>
            작은 시작,
            <br />
            무한한 가능성.
          </h1>
          <p className="intro">천체를 흡수하고, 우주를 발견하세요.</p>
          <section className="stats">
            <div className="stat-label">
              블랙홀 질량 <span>GAME MASS</span>
            </div>
            <div className="mass" title={`${fmtExact(state.mass)} M`}>
              <MassNumber value={state.mass} />
              <em>M</em>
            </div>
            <div className="minor-stat">
              <span>
                {fullyUpgraded(state) ? "특이점 폭주" : "사건의 지평선"}
              </span>
              <strong>
                {fmt(10 + state.mass * 0.025)} <small>R</small>
              </strong>
            </div>
            <div className="level-progress-label">현재 레벨 진행</div>
            <div className="level-row">
              <span>
                LEVEL <b>{String(lv).padStart(2, "0")}</b>
              </span>
              <small>
                {fmtExact(progress.earned)} / {fmtExact(progress.required)} M
              </small>
            </div>
            <div className="progress">
              <div
                style={{
                  width: `${progress.fraction * 100}%`,
                }}
              />
            </div>
            <p className="fine">
              다음 레벨까지 {fmtExact(progress.remaining)} M · 보상 +
              {levelReward(state)} P
            </p>
            <p className="exact-target">
              다음 레벨 누적 목표 <strong>{fmtExact(progress.target)} M</strong>
            </p>
          </section>
          {codexComplete(state) && (
            <div className="codex-status">
              <strong>✦ 우주 통달 활성화</strong>
              <span>질량 ×20 · 포인트 ×3 · 쿨타임 −40%</span>
            </div>
          )}
          <div className="metrics">
            <div>
              <strong>{fmt(total(state))}</strong>
              <span>흡수한 천체</span>
            </div>
            <div>
              <strong>
                {catalog}
                <small> / {bodies.length}</small>
              </strong>
              <span>발견한 천체</span>
            </div>
          </div>
          <section className="mission">
            <div className="eyebrow">
              CURRENT MISSION{" "}
              <span>
                {String(Math.min(state.mission + 1, missions.length)).padStart(
                  2,
                  "0",
                )}{" "}
                / {String(missions.length).padStart(2, "0")}
              </span>
            </div>
            <h2>{mission?.title || "끝없는 탐험"}</h2>
            <p>
              {mission?.description ||
                "도감을 완성했어요. 나만의 질량 기록을 계속 높여 보세요."}
            </p>
            {mission ? (
              <>
                <div className="mission-progress">
                  <span>
                    {Math.min(mission.value(state), mission.target)} /{" "}
                    {mission.target}
                  </span>
                  <span>보상 +{missionReward(state, mission)} P</span>
                </div>
                <div className="progress">
                  <div
                    style={{
                      width: `${Math.min(mission.value(state) / mission.target, 1) * 100}%`,
                    }}
                  />
                </div>
                <button
                  className="reward"
                  disabled={mission.value(state) < mission.target}
                  onClick={() => {
                    update(claim);
                    notify(`미션 완료 · +${missionReward(state, mission)} P`);
                  }}
                >
                  {mission.value(state) >= mission.target
                    ? "보상 받기 →"
                    : "탐험 진행 중"}
                </button>
              </>
            ) : (
              <>
                <p>
                  누적 흡수 {fmt(total(state))} / {fmt(expeditionTarget(state))}
                  개 · 보상 +{expeditionReward(state)} P
                </p>
                <button
                  className="reward"
                  disabled={total(state) < expeditionTarget(state)}
                  onClick={() => {
                    update(claim);
                    notify("반복 탐사 보상을 받았어요.");
                  }}
                >
                  반복 탐사 보상 받기
                </button>
              </>
            )}
          </section>
          <button className="upgrade-link" onClick={() => setTab("upgrades")}>
            <span>
              ✧ 업그레이드 포인트 <b>{state.points}</b>
            </span>
            <span>↗</span>
          </button>
          <button
            className="prestige-link"
            onClick={openPrestige}
            aria-label={prestigeUnlocked(state) ? "환생" : "환생 잠김"}
          >
            {prestigeUnlocked(state) ? (
              <>
                <span>✦ 환생 {state.rebirths || 0}회</span>
                <span>조각 {state.shards || 0}개 ↗</span>
              </>
            ) : (
              <span>🔒</span>
            )}
          </button>
          <p className="science-note">
            M·R은 게임용 단위입니다.
            <br />
            실제 천체 정보는 도감에서 확인하세요.
          </p>
        </aside>
        </div>
        <section
          className={`space-panel ${fullyUpgraded(state) && bodies.every((body) => isUnlocked(state, body)) ? "sky-mastery" : ""} ${fullyUpgraded(state) ? "singularity-overdrive" : ""} ${codexComplete(state) ? "codex-mastery" : ""}`}
        >
          <div className="space-heading">
            <span className="eyebrow">DEEP SPACE OBSERVATORY</span>
            <span className="live-tag">
              <span className="status-dot" />
              {ended ||
              paused ||
              (tab !== "play" && tab !== "upgrades") ||
              resetOpen
                ? "PAUSED"
                : "LIVE"}
            </span>
          </div>
          <Universe
            key={generation}
            state={state}
            onAbsorb={onAbsorb}
            queue={queue}
            controls={controls}
            paused={
              ended ||
              paused ||
              (tab !== "play" && tab !== "upgrades") ||
              resetOpen
            }
          />
          <div className="coordinate">
            RA 17h 45m · DEC −29° 00′ <span>SIMULATION 01</span>
          </div>
          <div className="hole-label">
            <span>사건의 지평선</span>
            <small>THE POINT OF NO RETURN</small>
          </div>
          <div className="space-bottom">
            <div className="selection-hint">
              <div>
                <strong>
                  {fullyUpgraded(state)
                    ? "특이점 폭주 · 질량 ×10 · 레벨 보상 ×3"
                    : autoUnlocked(state)
                      ? "천체 자동 생성 활성화"
                      : `${bodies.find((b) => b.id === selected).name} 선택됨`}
                </strong>
                <p>
                  {autoUnlocked(state)
                    ? autoStage(state) === 2
                      ? "각 천체가 쿨타임마다 자동 생성됩니다. 직접 소환도 가능해요."
                      : "1초마다 각 천체의 쿨타임을 확인해 준비된 천체를 모두 소환합니다. 60개부터 쿨타임 완료 즉시 소환해요."
                    : "클릭 또는 단축키로 소환하세요. 천체는 우주 공간 가장자리에서 나와요."}
                </p>
              </div>
            </div>
            <div className="playback">
              <div className="playback-actions">
                <button
                  className="sound-toggle"
                  aria-label={soundEnabled ? "소리 끄기" : "소리 켜기"}
                  aria-pressed={soundEnabled}
                  onClick={() => {
                    const next = !audioRef.current.enabled;
                    audioRef.current.setEnabled(next);
                    setSoundEnabled(next);
                  }}
                >
                  {soundEnabled ? "♪ 소리 켜짐" : "♪ 소리 꺼짐"}
                </button>
                <button
                  onClick={() => setPaused((p) => !p)}
                  aria-label={paused ? "계속하기" : "일시정지"}
                >
                  {paused ? "▶ 계속하기" : "Ⅱ 일시정지"}
                </button>
              </div>
            </div>
          </div>
        </section>
        <div className="panel-dock dock-right">
          <button className="panel-toggle" aria-label={rightCollapsed ? "천체 목록 펼치기" : "천체 목록 접기"} aria-expanded={!rightCollapsed} aria-controls="celestial-panel" onClick={() => {
            setRightCollapsed((v) => !v);
            if (rightCollapsed) setNewBodies([]);
          }}>
            {rightCollapsed ? "❮" : "❯"}
            {newBodies.length > 0 && <span className="notification-dot" role="img" aria-label="새 천체 해금" />}
          </button>
        <aside id="celestial-panel" className="right-panel" inert={rightCollapsed}>
          <div className="eyebrow">CELESTIAL OBJECTS</div>
          <div className="catalog-title">
            <h2>천체 생성</h2>
            <span>
              {bodies.filter((b) => isUnlocked(state, b)).length} /{" "}
              {bodies.length} 해금
            </span>
          </div>
          <p className="catalog-intro">
            추가 생성 {Math.round(extraSpawnChance(state) * 100)}% · 크리티컬{" "}
            {(criticalChance(state) * 100).toFixed(1)}% (질량 ×10)
            <br />
            {autoUnlocked(state)
              ? autoStage(state) === 2
                ? "개별 자동 생성 활성화 · 직접 소환과 쿨타임 공유"
                : "1초 간격 자동 생성 · 천체별 쿨타임 적용"
              : `단축키로 소환 · 업그레이드 ${upgradeCount(state)}/40개에서 자동 생성 해금`}
          </p>
          <div className="body-list">
            {bodies.map((b, i) => {
              const locked = !isUnlocked(state, b),
                remaining = Math.max(0, (state.cooldowns[b.id] || 0) - now);
              return (
                <button
                  key={b.id}
                  className={`body-card ${selected === b.id ? "selected" : ""} ${locked ? "locked" : ""}`}
                  disabled={locked}
                  aria-pressed={selected === b.id}
                  onClick={() => { setSelected(b.id); setNewBodies((ids) => ids.filter((id) => id !== b.id)); }}
                >
                  <kbd className="body-key">{shortcuts[i]}</kbd>
                  {newBodies.includes(b.id) && <span className="notification-dot body-new-dot" role="img" aria-label="새로 해금된 천체" />}
                  <Planet body={b} />
                  <span className="body-details">
                    <strong>
                      {b.name}
                      <small>{b.en}</small>
                    </strong>
                    <span>
                      {locked
                        ? `${b.rebirth && (state.rebirths || 0) < b.rebirth ? b.rebirth + "회 환생 · " : ""}${fmt(b.unlock)} M에 해금`
                        : `+${fmt(massGain(state, b))} M · ${(cooldown(state, b) / 1000).toFixed(1)}초`}
                    </span>
                  </span>
                  <span className="body-status">
                    {locked
                      ? "⌑"
                      : remaining > 0
                        ? `${(remaining / 1000).toFixed(1)}s`
                        : "생성 대기"}
                  </span>
                  {!locked && remaining > 0 && (
                    <span
                      className="cooldown-bar"
                      style={{
                        width: `${Math.min(remaining / cooldown(state, b), 1) * 100}%`,
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
          <div className="next-discovery">
            <span>✦ NEXT DISCOVERY</span>
            <p>
              {nextBody ? (
                <>
                  <b>{nextBody.name}</b>{" "}
                  {(state.rebirths || 0) < (nextBody.rebirth || 0)
                    ? `${nextBody.rebirth}회 환생 후 · `
                    : "까지 "}
                  {fmt(Math.max(0, nextBody.unlock - state.mass))} M
                </>
              ) : (
                <>
                  모든 천체를 해금했어요.
                  <br />
                  도감에 모두 기록해 보세요.
                </>
              )}
            </p>
          </div>
          <button className="codex-link" onClick={() => setTab("codex")}>
            나의 천체 도감 <span>↗</span>
          </button>
        </aside>
        </div>
      </main>
      <footer>
        <span>성장은 작은 끌림에서 시작됩니다.</span>
        <span>
          EVENT HORIZON <b>·</b> EXPLORE THE UNKNOWN
        </span>
      </footer>
      {tab === "prestige" && prestigeUnlocked(state) && (
        <PrestigePanel
          state={state}
          onClose={() => setTab("play")}
          onBuy={(id) => {
            const before = live.current;
            const after = update((s) =>
              id === "__all__"
                ? bulkUpgrade(s, true).state
                : buyPermanent(s, id),
            );
            if (after !== before)
              notify("영구 강화 완료 · 다음 환생에도 유지됩니다.");
          }}
          onRebirth={() => {
            const before = live.current;
            const after = update(rebirth);
            if (after === before) return;
            audioRef.current.playRebirth();
            queue.current = [];
            autoSchedule.current = { lastAt: -Infinity };
            setSelected("asteroid");
            setGeneration((g) => g + 1);
            setPaused(false);
            setTab("play");
            notify(
              `${after.rebirths}회 환생 완료 · 특이점 조각 +${after.shards - (before.shards || 0)}`,
            );
          }}
        />
      )}
      {tab === "endings" && endingsAvailable && (
        <div className="modal-backdrop" onClick={closeEndings}>
          <section
            className="modal ending-gallery-modal"
            role="dialog"
            aria-modal="true"
            aria-label="엔딩 종류"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={closeEndings}>닫기</button>
            <h2>엔딩 종류</h2>
            <p className="ending-gallery-intro">
              세 가지 선택, 서로 다른 우주의 끝.
            </p>
            <div className="ending-gallery">
              {[
                {
                  id: "normal",
                  number: "01",
                  name: "일반 엔딩",
                  subtitle: "우주에 삼켜진 자",
                  hint: "400레벨을 도달하세요",
                },
                {
                  id: "hacking",
                  number: "02",
                  name: "치트 엔딩",
                  subtitle: "덮어쓴 결말",
                  hint: "어딘가에서 jis를 눌러보세요",
                },
                {
                  id: "survivor",
                  number: "03",
                  name: "생존자 엔딩",
                  subtitle: "가장 조용한 선택",
                  hint: "아무것도 하지마세요",
                },
              ].map((ending) => {
                const unlocked = unlockedEndings.includes(ending.id);
                return (
                  <article
                    key={ending.id}
                    className={
                      "ending-tile " + (unlocked ? "is-unlocked" : "is-locked")
                    }
                  >
                    <div className="ending-tile-top">
                      <span>ENDING {ending.number}</span>
                      <b>{unlocked ? "해금 완료" : "🔒 미해금"}</b>
                    </div>
                    <h3>{ending.name}</h3>
                    <p className="ending-tile-subtitle">{ending.subtitle}</p>
                    <div className="ending-tile-hint">
                      <strong>해금 힌트</strong>
                      <p>{ending.hint}</p>
                    </div>
                    <button
                      disabled={!unlocked}
                      onClick={() => {
                        audioRef.current.unlock();
                        setReplayVariant(ending.id);
                        setCreditsReplay(true);
                      }}
                    >
                      {unlocked ? "엔딩 연출부터 다시 보기" : "잠겨 있음"}
                    </button>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      )}
      {tab !== "play" && tab !== "prestige" && tab !== "endings" && (
        <div className="modal-backdrop" onClick={() => setTab("play")}>
          <section
            className={`modal ${tab === "upgrades" ? "skills-modal" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-label={tab === "upgrades" ? "업그레이드" : "천체 도감"}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              autoFocus
              className="close"
              aria-label="닫기"
              onClick={() => setTab("play")}
            >
              ×
            </button>
            <div className="eyebrow">
              {tab === "upgrades"
                ? "EVOLVE YOUR SINGULARITY"
                : "ARCHIVE OF THE UNIVERSE"}
            </div>
            <h2>
              {tab === "upgrades"
                ? "더 강한 끌림을 향해"
                : "당신이 발견한 우주"}
            </h2>
            <p className="modal-description">
              {tab === "upgrades"
                ? `보유 포인트 ${state.points} P · 레벨업과 미션으로 포인트를 모으세요.`
                : `${catalog} / ${bodies.length}종 발견 · 천체를 처음 흡수하면 실제 정보가 기록됩니다.`}
            </p>
            {tab === "upgrades" ? (
              <SkillTree
                state={state}
                onBuy={(id) =>
                  update((s) =>
                    id === "__all__" ? bulkUpgrade(s).state : buy(s, id),
                  )
                }
              />
            ) : (
              <>
                <div className="codex-mastery-banner">
                  <strong>
                    {codexComplete(state)
                      ? "✦ 우주 통달 활성화"
                      : "✦ 전체 도감 15종 완성 보상 · 우주 통달"}
                  </strong>
                  <p>
                    영구 흡수 질량 ×20 · 레벨업·미션·반복 탐사 포인트 ×3 ·
                    쿨타임 40% 감소 (최소 0.12초). 환생 후에도 유지되며 특이점
                    폭주와 중첩됩니다.
                  </p>
                </div>
                <div className="codex-grid">
                  {bodies.map((b) => (
                    <article
                      key={b.id}
                      className={`codex-card ${!hasDiscovered(state, b.id) ? "undiscovered" : ""}`}
                    >
                      <Planet body={b} large />
                      <div className="eyebrow">{b.kind}</div>
                      <h3>
                        {hasDiscovered(state, b.id) ? b.name : "미발견 천체"}
                      </h3>
                      <p>
                        {hasDiscovered(state, b.id)
                          ? b.fact
                          : `${b.rebirth ? b.rebirth + "회 환생 후 · " : ""}${fmt(b.unlock)} M부터 생성 가능. 첫 흡수 후 정보가 공개됩니다.`}
                      </p>
                      {hasDiscovered(state, b.id) && (
                        <a href={b.source} target="_blank" rel="noreferrer">
                          NASA에서 더 알아보기 ↗
                        </a>
                      )}
                    </article>
                  ))}
                </div>
                <div className="blackhole-fact">
                  <strong>
                    블랙홀도 우주의 모든 것을 무조건 빨아들이지는 않아요.
                  </strong>
                  <p>
                    사건의 지평선은 빛도 빠져나올 수 없는 경계입니다. 충분히
                    멀리 있는 천체는 블랙홀 주위를 공전할 수 있습니다. 이 게임의
                    흡수 연출과 성장 속도는 실제 물리 현상을 단순화했습니다.
                  </p>
                  <a
                    href="https://science.nasa.gov/universe/black-holes/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    블랙홀에 관한 NASA 자료 ↗
                  </a>
                </div>
              </>
            )}
          </section>
        </div>
      )}
      {endingRestartOpen && (
        <div
          className="modal-backdrop ending-choice-backdrop"
          style={{ zIndex: 14000 }}
        >
          <section
            className="modal ending-choice"
            role="dialog"
            aria-modal="true"
            aria-label="처음부터 하시겠습니까?"
            aria-describedby="ending-choice-message"
          >
            <span className="ending-choice-orbit" aria-hidden="true">
              ◉
            </span>
            <p className="ending-choice-eyebrow">BEYOND THE END</p>
            <h2>처음부터 하시겠습니까?</h2>
            <p id="ending-choice-message" className="ending-choice-message">
              후회하지 않을 선택을 하시길 바랍니다
            </p>
            <p className="ending-choice-note">
              새로 시작해도 해금한 엔딩은 유지됩니다.
            </p>
            <div className="ending-choice-actions">
              <button
                autoFocus
                onClick={() => {
                  update(() => ({ ...fresh(), unlockedEndings }));
                  autoSchedule.current = { lastAt: -Infinity };
                  setSelected("asteroid");
                  setGeneration((g) => g + 1);
                  setResetOpen(false);
                  queue.current = [];
                  setSurvivorEnding(false);
                  setCreditsReplay(false);
                  setAchievementVisible(false);
                  setPaused(false);
                  setToast("");
                  setEndingRestartOpen(false);
                  setEndingRestartConfirmed(false);
                  setTab("play");
                }}
              >
                <strong>yes</strong>
                <span>새로운 우주 시작</span>
              </button>
              <button
                onClick={() => {
                  setEndingRestartOpen(false);
                  setResetOpen(false);
                  setPaused(false);
                  setTab("play");
                }}
              >
                <strong>no</strong>
                <span>현재 우주에 머물기</span>
              </button>
            </div>
          </section>
        </div>
      )}
      {resetOpen && (
        <div className="modal-backdrop">
          <section
            className="modal reset-modal"
            role="dialog"
            aria-modal="true"
            aria-label="게임 초기화 확인"
          >
            <h2>새로운 우주를 시작할까요?</h2>
            <p>
              환생과는 달리 모든 기록을 삭제합니다. 질량, 도감, 업그레이드,
              미션, 환생 횟수, 최고 기록과 특이점 조각까지 초기화됩니다.
            </p>
            <div>
              <button autoFocus onClick={() => setResetOpen(false)}>
                계속 탐험하기
              </button>
              <button
                className="danger"
                onClick={() => {
                  queue.current = [];
                  update(fresh);
                  setAchievementVisible(false);
                  setSelected("asteroid");
                  setResetOpen(false);
                  setPaused(false);
                  setGeneration((g) => g + 1);
                  notify("새로운 탐험을 시작합니다.");
                }}
              >
                초기화하기
              </button>
            </div>
          </section>
        </div>
      )}
      {codexComplete(state) && !state.codexNoticeSeen && (
        <aside
          className="prestige-unlock-notice codex-unlock-notice"
          role="alert"
          aria-label="우주 통달 달성 알림"
        >
          <strong>✦ 전체 도감 완성! 우주 통달 활성화</strong>
          <p>15종의 천체를 모두 발견했어요.</p>
          <ul>
            <li>영구 흡수 질량 ×20</li>
            <li>레벨업·미션·반복 탐사 포인트 ×3</li>
            <li>소환 쿨타임 40% 감소 · 최소 0.12초</li>
          </ul>
          <small>환생 후에도 유지되며 특이점 폭주와 함께 적용됩니다.</small>
          <div>
            <button
              onClick={() => update((s) => ({ ...s, codexNoticeSeen: true }))}
            >
              확인 · 계속 성장하기
            </button>
          </div>
        </aside>
      )}
      {state.rebirths === 0 &&
        (!codexComplete(state) || state.codexNoticeSeen) &&
        fullyUpgraded(state) &&
        !state.prestigeNoticeSeen && (
          <aside
            className="prestige-unlock-notice"
            role="alert"
            aria-label="환생 해금 알림"
          >
            <strong>✦ 환생이 해금되었어요!</strong>
            <p>
              일반 업그레이드 80개를 모두 완료했어요. 이제 환생 메뉴에서 특이점
              조각과 영구 강화를 확인할 수 있어요.
            </p>
            <small>실제 환생에는 기본 도감·질량·100 P 조건도 필요합니다.</small>
            <div>
              <button
                onClick={() => {
                  update((s) => ({ ...s, prestigeNoticeSeen: true }));
                  openPrestige();
                }}
              >
                환생 메뉴 보기
              </button>
              <button
                onClick={() =>
                  update((s) => ({ ...s, prestigeNoticeSeen: true }))
                }
              >
                확인
              </button>
            </div>
          </aside>
        )}
      <AchievementToast
        visible={achievementVisible}
        onDismiss={dismissAchievement}
      />
      <div className={`toast ${toast ? "visible" : ""}`} role="status">
        ✦ {toast}
      </div>
    </div>
  );
}
createRoot(document.getElementById("root")).render(<App />);
