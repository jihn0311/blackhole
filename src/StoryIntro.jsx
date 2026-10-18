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
        <g transform={`translate(${page<3?680:740} 180)`}>
          <ellipse rx="150" ry="44" fill="none" stroke="url(#comic-disk)" strokeWidth="12" transform="rotate(-16)"/>
          <circle r="68" fill="#03050a" stroke="#ef8347" strokeWidth="5"/>
          <path d="M-145 40 Q0 -12 145 -40" fill="none" stroke="#ffb46c" strokeWidth="10"/>
        </g>
        {page<3 ? <g opacity={page===1?.65:1}><circle cx="220" cy="240" r="78" fill="url(#comic-planet)" stroke="#97c9df" strokeWidth="3"/><path d="M175 185L210 206 197 236 240 253 254 295M243 174L267 205 248 223" fill="none" stroke="#527f80" strokeWidth="17"/>{[0,1,2,3].map(i=><path key={i} d={`M${320+i*45} ${220-i*9}l28 -7`} stroke="#7da2be" strokeWidth="3"/>)}<circle cx="390" cy="145" r="23" fill="#929baa"/></g> : <g>
          <path d="M0 330L200 290H500L600 430H0Z" fill="#202d42" stroke="#7c91ac" strokeWidth="3"/>
          <path d="M80 70H430V270H80Z" fill="#101e30" stroke="#8aa7c1" strokeWidth="4"/>
          <circle cx="255" cy="165" r="55" fill="none" stroke="#66ddd1" strokeWidth="3"/>
          <ellipse cx="255" cy="165" rx="90" ry="25" fill="none" stroke="#66ddd1" strokeDasharray="8 8"/>
          <text x="255" y="245" textAnchor="middle" fill="#8ef2df" fontSize="16">{["", "", "", "SUPPLY HYPOTHESIS", "SYNTHETIC PLANETS", "OPERATOR SELECTED", "STATION CONNECTED", "SYNTHESIS READY"][page]}</text>
          {page>=5 && <g><path d="M330 430V330Q330 290 385 290Q440 290 440 330V430" fill="#c6ced6" stroke="#111e31" strokeWidth="6"/><circle cx="385" cy="252" r="43" fill="#b9c6d3" stroke="#101f33" strokeWidth="6"/><path d="M350 245Q385 222 419 245V269H350Z" fill="#132c45" stroke="#79b8cb" strokeWidth="3"/></g>}
          <path d="M475 175H545M530 160L548 175 530 190" stroke="#6be3d2" strokeWidth="4" fill="none"/>
          <circle cx="585" cy="175" r={page===7?26:18} fill="url(#comic-planet)" stroke="#9feadf" strokeWidth="3"/>
        </g>}
        {page===0 && <g stroke="#8fe3ef" fill="none"><circle cx="180" cy="115" r="65"/><circle cx="180" cy="115" r="40"/><path d="M180 45V185M110 115H250M180 115L230 75" strokeWidth="3"/></g>}
        {page===1 && <g stroke="#f78366" fill="none" strokeWidth="3"><ellipse cx="350" cy="290" rx="90" ry="30" strokeDasharray="6 10"/><path d="M330 270L370 310M370 270L330 310"/></g>}
        {page===2 && <g><path d="M120 350H620" stroke="#f17665" strokeWidth="3" strokeDasharray="10 8"/>{[0,1,2,3,4].map(i=><circle key={i} cx={170+i*90} cy="350" r={8+i*3} fill={i===2?"#64b7df":"#b99d7b"}/>)}<text x="150" y="400" fill="#ff9480" fontSize="19">SOLAR SYSTEM / AT RISK</text></g>}
        {page===3 && <text x="255" y="173" textAnchor="middle" fill="#e5d3a0" fontSize="65">?</text>}
        {page===4 && [0,1,2].map(i=><circle key={i} cx={205+i*50} cy="165" r={10+i*4} fill={["#bba18d","#79bbcf","#c6ad84"][i]}/>)}
        {page===5 && <text x="600" y="335" fill="#e8c793" fontSize="20">MISSION ACCEPTED</text>}
        {page===6 && <path d="M540 320H850V360H540ZM695 275V405M510 295V385M880 295V385" stroke="#a4c4dc" strokeWidth="7" fill="#23374d"/>}
        {page===7 && <path d="M590 225L620 245 590 265Z" fill="#a0f3d7"/>}
      </svg>
      <div className="comic-caption"><h1>{scenes[page].title}</h1><p>{scenes[page].text}</p></div>
    </div>
    <button ref={button} className="intro-next" onClick={advance}>스페이스 바 클릭 <span>→</span></button>
    <span className="intro-page">{page+1} / {scenes.length}</span>
  </section>, document.body);
}
