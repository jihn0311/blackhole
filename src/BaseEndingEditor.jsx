import React from 'react';
import {endingRules} from './endingRules.js';
export function BaseEndingEditor({config,onChange}) {
 const rules=endingRules(config.baseEndings);
 const names={normal:'일반 엔딩',hacking:'치트 엔딩',survivor:'생존자 엔딩',happy:'최종 엔딩'};
 const change=(id,key,value)=>onChange('baseEndings',{...rules,[id]:{...rules[id],[key]:value}});
 return <section className="admin-card"><h2>기본 엔딩 조건·삭제</h2><p>삭제하면 게임에서 비활성화하고 최종 엔딩·랭킹 필수 목록에서 제외합니다. 기존 감상 기록은 보존합니다.</p>{Object.entries(rules).map(([id,r])=><article className="admin-scene" key={id}><h3>{names[id]}{!r.enabled?' · 삭제됨':''}</h3><button onClick={()=>{if(!r.enabled||window.confirm(`${names[id]}을 삭제할까요? 배포 후 적용됩니다.`))change(id,'enabled',!r.enabled);}}>{r.enabled?'엔딩 삭제':'엔딩 복원'}</button>{'level'in r&&<label className="admin-setting">필요 레벨 (1~1000)<input type="number" min="1" max="1000" value={r.level} onChange={e=>change(id,'level',Number(e.target.value))}/></label>}{id==='hacking'&&<p>안전 제한 해제 후 지정 레벨에 도달하면 시작합니다.</p>}{id==='survivor'&&<label className="admin-setting">아무것도 하지 않고 기다릴 시간 (초)<input type="number" min="1" max="3600" value={r.seconds} onChange={e=>change(id,'seconds',Number(e.target.value))}/></label>}{id==='happy'&&<p>삭제되지 않은 일반·치트·생존자 엔딩을 감상하고 새로운 우주에서 시작합니다.</p>}</article>)}</section>;
}
