-- Supabase SQL Editor에서 전체 실행
create table if not exists public.mass_rankings (
  player_hash text primary key,
  nickname text not null check (char_length(nickname) between 1 and 16),
  best_mass double precision not null check (best_mass >= 0 and best_mass < 'Infinity'::float8),
  updated_at timestamptz not null default now()
);
alter table public.mass_rankings enable row level security;
revoke all on public.mass_rankings from anon, authenticated;
grant select, insert, update on public.mass_rankings to service_role;
create index if not exists mass_rankings_score on public.mass_rankings (best_mass desc, updated_at asc);
create or replace function public.submit_mass(p_hash text, p_name text, p_mass double precision)
returns void language sql security invoker set search_path = public as $$
 insert into public.mass_rankings(player_hash,nickname,best_mass)
 values(p_hash,p_name,p_mass)
 on conflict(player_hash) do update set
 nickname=excluded.nickname,
 best_mass=greatest(mass_rankings.best_mass,excluded.best_mass),
 updated_at=case when excluded.best_mass > mass_rankings.best_mass then now() else mass_rankings.updated_at end;
$$;
revoke all on function public.submit_mass(text,text,double precision) from public, anon, authenticated;
grant execute on function public.submit_mass(text,text,double precision) to service_role;
