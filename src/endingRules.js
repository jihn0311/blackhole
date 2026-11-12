export const endingDefaults={normal:{enabled:true,level:400},hacking:{enabled:true,level:400},survivor:{enabled:true,seconds:120},happy:{enabled:true}};
export function endingRules(config={}) {return Object.fromEntries(Object.entries(endingDefaults).map(([id,d])=>[id,{...d,...config[id]}]));}
export function validateEndingRules(value={}) {
 if(!value || typeof value!=='object' || Array.isArray(value))throw new Error('엔딩 설정을 확인하세요.');
 const result=endingRules();
 for(const [id,v] of Object.entries(value)) {
  if(!result[id]||!v||typeof v!=='object')throw new Error('알 수 없는 엔딩 설정입니다.');
  for(const [key,n] of Object.entries(v)) {
   if(!(key in result[id]))throw new Error('지원하지 않는 엔딩 조건입니다.');
   if(key==='enabled'){if(typeof n!=='boolean')throw new Error('엔딩 활성 상태를 확인하세요.');}
   else if(!Number.isInteger(n)||n<1||n>(key==='seconds'?3600:1000))throw new Error('엔딩 조건 수치를 확인하세요.');
   result[id][key]=n;
  }
 }
 return result;
}
export function collectedRequired(rules,seen,includeHappy=true){const ids=Object.keys(rules).filter(id=>rules[id].enabled&&(includeHappy||id!=='happy'));return (!includeHappy||ids.length>0)&&ids.every(id=>seen.includes(id));}
