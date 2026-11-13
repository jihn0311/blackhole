import React,{useState,useEffect} from 'react';
import {createPortal} from 'react-dom';
import {level,upgradeCount} from './game.js';
const steps=[
 ['첫 천체를 소환해요','빛나는 소행성 버튼을 한 번 눌러보세요.','.body-card'],
 ['천체가 흡수돼요','블랙홀로 다가가는 천체를 지켜보세요.','canvas'],
 ['질량이 늘었어요','천체를 흡수한 만큼 이 숫자가 증가해요.','.mass'],
 ['레벨을 올려요','소행성을 더 소환해서 2레벨에 도달해 보세요.','.level-row'],
 ['업그레이드를 열어요','위쪽 업그레이드 버튼을 눌러보세요.','[data-tutorial="upgrades"]'],
 ['첫 스킬을 강화해요','구매할 수 있는 스킬 하나를 눌러보세요. 포인트가 부족하면 조금 더 성장해요.','.radial-node.available'],
 ['준비 완료!','튜토리얼을 다시 보려면 도감에서 확인하세요.','[data-tutorial="codex"]'],
];
export function LocalTutorial({state,spawned,hidden,replay=0,tab}){
 const [step,setStep]=useState(0),[active,setActive]=useState(()=>{try{return localStorage.getItem("event-horizon-tutorial-v1")!=="done";}catch{return true;}}),[rect,setRect]=useState(null);
 useEffect(()=>{if(replay>0){setStep(0);setActive(true);}},[replay]);
 useEffect(()=>{if(!active||replay>0)return;if(step===0&&spawned>0)setStep(1);if(step===1&&state.mass>0)setStep(2);if(step===3&&level(state.mass)>1)setStep(4);if(step===4&&tab==='upgrades')setStep(5);if(step===5&&upgradeCount(state)>0)setStep(6);},[active,step,spawned,state,replay,tab]);
 useEffect(()=>{if(!active||hidden)return;const update=()=>{const el=document.querySelector(steps[step][2]);if(el){const r=el.getBoundingClientRect();setRect({x:r.x,y:r.y,width:r.width,height:r.height});}else setRect(null);};update();const timer=setInterval(update,150);return()=>clearInterval(timer);},[active,hidden,step]);
 function finish(){setActive(false);try{localStorage.setItem("event-horizon-tutorial-v1","done");}catch{}}
 if(hidden||!active)return null;
 const width=Math.min(320,window.innerWidth-32),height=205;
 const center=rect?rect.x+rect.width/2:window.innerWidth/2;
 const left=Math.max(16,Math.min(window.innerWidth-width-16,center-width/2));
 const below=rect&&rect.y+rect.height+height+24<window.innerHeight;
 const top=rect?Math.max(16,Math.min(window.innerHeight-height-16,below?rect.y+rect.height+16:rect.y-height-16)):window.innerHeight-height-24;
 return createPortal(<>
 {rect&&<div style={{position:'fixed',left:rect.x-4,top:rect.y-4,width:rect.width+8,height:rect.height+8,border:'3px solid #ffcf65',borderRadius:12,boxShadow:'0 0 24px #ffca5877',pointerEvents:'none',zIndex:30000}}/>}
 <aside style={{position:'fixed',left,top,width,boxSizing:'border-box',padding:18,background:'#251d16f5',color:'#fff8e8',border:'2px solid #b38a50',borderRadius:10,zIndex:30001,boxShadow:'0 10px 35px #0009'}}>
 {rect&&<span style={{position:'absolute',left:Math.max(16,Math.min(width-30,center-left-8)),...(below?{top:-10}:{bottom:-10}),width:16,height:16,background:'#251d16',borderLeft:below?'2px solid #b38a50':0,borderTop:below?'2px solid #b38a50':0,borderRight:below?0:'2px solid #b38a50',borderBottom:below?0:'2px solid #b38a50',transform:'rotate(45deg)'}}/>}
 <small style={{color:'#dbc29a'}}>조작 안내 {step+1} / {steps.length}</small><h3 style={{color:'#ffda70',margin:'8px 0'}}>{steps[step][0]}</h3><p style={{lineHeight:1.6,margin:'8px 0 14px'}}>{steps[step][1]}</p>
 {(replay>0||step===2)&&step<6&&<button onClick={()=>setStep(v=>v+1)}>확인 · 다음 →</button>}
 <button style={{marginLeft:8}} onClick={finish}>{step===6?'게임 계속하기':'건너뛰기'}</button>
 </aside></>,document.body);
}
