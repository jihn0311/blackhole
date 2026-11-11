import { createHash } from 'node:crypto';
export function validScore(data) {
 if (!/^[a-f0-9]{64}$/.test(data.token || '')) throw new Error('플레이어 식별 정보가 올바르지 않습니다.');
 const name=typeof data.nickname==='string' ? data.nickname.trim() : '';
 if (!name || [...name].length>16 || /[\x00-\x1f\x7f]/.test(name)) throw new Error('닉네임은 1~16자로 입력해주세요.');
 if (typeof data.mass!=='number' || !Number.isFinite(data.mass) || data.mass<0) throw new Error('질량 값이 올바르지 않습니다.');
 if (data.cheatUsed !== false) throw new Error('치트를 사용한 기록은 등록할 수 없습니다.');
 return {p_hash:createHash('sha256').update(data.token).digest('hex'),p_name:name,p_mass:data.mass};
}
export function rankingHandler() {
 const recent=new Map();
 return async(req,res,url)=>{
  const origin=req.headers.origin;
  const allowed=['https://jihn0311.github.io','https://blackhole-bxhq.onrender.com'];
  const send=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json'});res.end(JSON.stringify(data));};
  if(origin && !allowed.includes(origin)) return send(403,{error:'허용되지 않은 요청입니다.'});
  if(origin) {res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin');}
  if(req.method==='OPTIONS') {res.setHeader('Access-Control-Allow-Methods','GET, POST');res.setHeader('Access-Control-Allow-Headers','Content-Type');res.writeHead(204).end();return;}
  const base=process.env.SUPABASE_URL, key=process.env.SUPABASE_SECRET_KEY;
  if(!base || !key) return send(503,{error:'랭킹 저장소를 연결 중입니다.'});
  const db=async(path,options={})=>{
   const r=await fetch(`${base.replace(/\/$/,'')}/rest/v1/${path}`,{...options,signal:AbortSignal.timeout(15000),headers:{apikey:key,...(key.startsWith('sb_secret_')?{}:{Authorization:`Bearer ${key}`}), 'Content-Type':'application/json'}});
   if(!r.ok) throw new Error('랭킹 저장소가 준비되지 않았거나 응답하지 않습니다. 잠시 후 다시 시도해주세요.');
   return r.status===204?null:r.text();
  };
  try {
   if(req.method==='GET') {
    const rows=JSON.parse(await db('mass_rankings?select=nickname,best_mass&order=best_mass.desc,updated_at.asc,player_hash.asc&limit=100'));
    return send(200,{rows});
   }
   if(req.method!=='POST' || !allowed.includes(origin) || !req.headers['content-type']?.startsWith('application/json')) return send(403,{error:'허용되지 않은 요청입니다.'});
   let raw=''; for await(const chunk of req) {raw+=chunk;if(Buffer.byteLength(raw)>2048) return send(413,{error:'요청이 너무 큽니다.'});}
   const score=validScore(JSON.parse(raw));
   const now=Date.now();for(const [k,t] of recent) if(now-t>60000) recent.delete(k);
   if(recent.size>10000 || now-(recent.get(score.p_hash)||0)<30000) return send(429,{error:'기록 등록은 30초마다 가능합니다.'});
   recent.set(score.p_hash,now);
   await db('rpc/submit_mass',{method:'POST',body:JSON.stringify(score)});
   return send(200,{ok:true});
  }catch(e){return send(400,{error:e instanceof SyntaxError?'올바르지 않은 요청입니다.':e.message});}
 };
}
