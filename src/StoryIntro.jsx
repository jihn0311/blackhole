import gameSettings from "./gameSettings.json";
import comicArt from "./assets/prologue-comic-v3.png";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
const scenes = gameSettings.scenes;
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
