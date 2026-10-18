import comicArt from "./assets/prologue-comic-v3.png";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
const scenes = [
  { title: "낯선 신호", text: "태양계 외곽의 관측망이 이상한 중력 신호를 포착했다. 별빛이 휘어지는 곳에, 정체불명의 블랙홀이 있었다." },
  { title: "사라지는 이웃", text: "작은 위성이 먼저 사라졌다. 다음은 그 곁의 행성. 관측 화면에는 빈 궤도만 남았다." },
  { title: "다음은 태양계", text: "예측된 경로의 끝에는 우리가 살던 태양계가 있었다. 인류에게는 시간을 벌 방법이 필요했다." },
  { title: "하나의 가설", text: "연구진은 천체를 공급하면 블랙홀의 접근을 늦출 수 있다고 믿었다. 하지만 실제 행성을 희생할 수는 없었다." },
  { title: "인공 천체 합성", text: "첨단 합성 장치가 답이었다. 소행성부터 지구와 목성까지, 질량과 구조를 재현한 복제체를 만들어 공급하는 계획이었다." },
  { title: "당신에게 온 임무", text: "사건의 지평선 계획이 승인되었다. 천체 합성 장치의 운용자로 선택된 사람은, 바로 당신이었다." },
  { title: "마지막 관측소", text: "긴 항해 끝에 블랙홀 앞의 관측소에 도착했다. 창밖에서는 거대한 빛의 고리가 조용히 회전하고 있었다." },
  { title: "첫 번째 공급", text: "합성 장치가 켜졌다. 태양계를 구할 수 있다는 믿음과 함께. 이제 첫 번째 인공 천체를 준비할 차례다." },
];
export function StoryIntro({ onComplete }) {
  const [page, setPage] = useState(0);
  const button = useRef(null);
  const rows = [0, 355, 701, 1090, 1536];
  const row = Math.floor(page / 2);
  const panelHeight = rows[row + 1] - rows[row];
  const advance = () => page < scenes.length - 1 ? setPage(page + 1) : onComplete();
  useEffect(() => {
    button.current?.focus();
    const key = (event) => {
      if (event.code !== "Space" && event.key !== " ") return;
      event.preventDefault(); event.stopImmediatePropagation();
      if (!event.repeat) advance();
    };
    window.addEventListener("keydown", key, true);
    return () => window.removeEventListener("keydown", key, true);
  }, [page]);
  return createPortal(<section className="story-intro" role="dialog" aria-modal="true" aria-label="사건의 지평선 이야기">
    <div className="intro-comic" key={page}>
      <div className="comic-chapter">PROLOGUE / 0{page + 1}</div>
      <div className="comic-art-frame" style={{ aspectRatio: `512 / ${panelHeight}`, width: `min(100%, ${48 * 512 / panelHeight}vh)` }}>
        <img src={comicArt} alt={scenes[page].title} draggable="false"
          style={{ left: page % 2 ? "-100%" : "0", top: `${-rows[row] / panelHeight * 100}%` }} />
      </div>
      <div className="comic-caption"><h1>{scenes[page].title}</h1><p>{scenes[page].text}</p></div>
    </div>
    <button ref={button} className="intro-next" onClick={advance}>스페이스 바 클릭 <span>→</span></button>
    <span className="intro-page">{page+1} / {scenes.length}</span>
  </section>, document.body);
}
