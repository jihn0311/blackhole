import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
const scenes = [
  { title: "사라지는 별들", text: "태양계 외곽에 나타난 블랙홀. 주변의 행성과 위성이 하나씩 빛을 잃기 시작했다." },
  { title: "사건의 지평선 계획", text: "인류는 첨단 합성 장치로 인공 천체를 만들어 공급하기로 했다. 허기를 달래면, 태양계를 향한 접근도 늦출 수 있을 것이다." },
  { title: "마지막 관측소", text: "당신은 천체 합성 장치의 운용자로 파견되었다. 지구와 목성을 닮은 복제체를 만들어 블랙홀에 공급하는 것이 임무다." },
  { title: "첫 번째 공급", text: "관측소의 불이 켜졌다. 태양계를 구할 수 있다는 믿음과 함께. 당신은 첫 번째 인공 천체를 준비한다." },
];
export function StoryIntro({ onComplete }) {
  const [page, setPage] = useState(0);
  const button = useRef(null);
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
      <svg viewBox="0 0 960 430" role="img" aria-label={scenes[page].title}>
        <defs><radialGradient id="comic-planet"><stop stopColor="#a2dce4"/><stop offset="1" stopColor="#173253"/></radialGradient><linearGradient id="comic-disk"><stop stopColor="#ff953e"/><stop offset="1" stopColor="#b22c29"/></linearGradient></defs>
        <rect width="960" height="430" fill="#0b1222" />
        {Array.from({length:65},(_,i)=><circle key={i} cx={(i*137+31)%960} cy={(i*89+17)%430} r={i%3===0?2:1} fill="#c2d9ed" opacity={.2+(i%4)*.15}/>)}
        <g transform={`translate(${page===0?640:740} 180)`}>
          <ellipse rx="150" ry="44" fill="none" stroke="url(#comic-disk)" strokeWidth="12" transform="rotate(-16)"/>
          <circle r="68" fill="#03050a" stroke="#ef8347" strokeWidth="5"/>
          <path d="M-145 40 Q0 -12 145 -40" fill="none" stroke="#ffb46c" strokeWidth="10"/>
        </g>
        {page===0 ? <g><circle cx="220" cy="240" r="78" fill="url(#comic-planet)" stroke="#97c9df" strokeWidth="3"/><path d="M175 185L210 206 197 236 240 253 254 295M243 174L267 205 248 223" fill="none" stroke="#527f80" strokeWidth="17"/>{[0,1,2,3].map(i=><path key={i} d={`M${320+i*45} ${220-i*9}l28 -7`} stroke="#7da2be" strokeWidth="3"/>)}<circle cx="390" cy="145" r="23" fill="#929baa"/></g> : <g>
          <path d="M0 330L200 290H500L600 430H0Z" fill="#202d42" stroke="#7c91ac" strokeWidth="3"/>
          <path d="M80 70H430V270H80Z" fill="#101e30" stroke="#8aa7c1" strokeWidth="4"/>
          <circle cx="255" cy="165" r="55" fill="none" stroke="#66ddd1" strokeWidth="3"/>
          <ellipse cx="255" cy="165" rx="90" ry="25" fill="none" stroke="#66ddd1" strokeDasharray="8 8"/>
          <text x="255" y="245" textAnchor="middle" fill="#8ef2df" fontSize="16">{page===1?"ARTIFICIAL CELESTIAL BODY":page===2?"OPERATOR CONNECTED":"SYNTHESIS READY"}</text>
          {page>=2 && <g><path d="M330 430V330Q330 290 385 290Q440 290 440 330V430" fill="#c6ced6" stroke="#111e31" strokeWidth="6"/><circle cx="385" cy="252" r="43" fill="#b9c6d3" stroke="#101f33" strokeWidth="6"/><path d="M350 245Q385 222 419 245V269H350Z" fill="#132c45" stroke="#79b8cb" strokeWidth="3"/></g>}
          <path d="M475 175H545M530 160L548 175 530 190" stroke="#6be3d2" strokeWidth="4" fill="none"/>
          <circle cx="585" cy="175" r={page===3?26:18} fill="url(#comic-planet)" stroke="#9feadf" strokeWidth="3"/>
        </g>}
      </svg>
      <div className="comic-caption"><h1>{scenes[page].title}</h1><p>{scenes[page].text}</p></div>
    </div>
    <button ref={button} className="intro-next" onClick={advance}>스페이스 바 클릭 <span>→</span></button>
    <span className="intro-page">{page+1} / {scenes.length}</span>
  </section>, document.body);
}
