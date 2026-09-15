-- EC-CLOUD-07: atomically finalize a validated mission attempt and grant first-completion rewards.
-- Validation of chess evidence remains server-side. This RPC is the single database transaction boundary.

create or replace function public.finalize_validated_mission_attempt(
  p_user_id uuid,
  p_mission_id text,
  p_attempt_id uuid,
  p_validation_feedback jsonb default null
)
returns table (
  first_completion boolean,
  reward_xp bigint,
  reward_ets bigint,
  reward_stars bigint,
  balance_xp bigint,
  balance_ets bigint,
  balance_stars bigint
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_mission public.missions%rowtype;
  v_attempt public.mission_attempts%rowtype;
  v_first boolean := false;
  v_xp bigint := 0;
  v_ets bigint := 0;
  v_stars bigint := 0;
  v_balance public.player_balances%rowtype;
begin
  if p_user_id is null or p_mission_id is null or btrim(p_mission_id) = '' or p_attempt_id is null then
    raise exception 'user_id, mission_id and attempt_id are required' using errcode = '22023';
  end if;

  select * into v_mission
  from public.missions
  where id = p_mission_id and enabled = true
  for share;
  if not found then
    raise exception 'mission is not available' using errcode = 'P0002';
  end if;

  select * into v_attempt
  from public.mission_attempts
  where id = p_attempt_id and user_id = p_user_id and mission_id = p_mission_id
  for update;
  if not found then
    raise exception 'attempt does not belong to user/mission' using errcode = 'P0002';
  end if;

  if v_attempt.status not in ('started', 'submitted', 'passed') then
    raise exception 'attempt cannot be finalized from status %', v_attempt.status using errcode = '23514';
  end if;

  update public.mission_attempts
  set status = 'passed',
      validation_feedback = coalesce(p_validation_feedback, validation_feedback),
      submitted_at = coalesce(submitted_at, now()),
      finished_at = coalesce(finished_at, now())
  where id = p_attempt_id;

  insert into public.mission_completions(user_id, mission_id, first_attempt_id)
  values (p_user_id, p_mission_id, p_attempt_id)
  on conflict (user_id, mission_id) do nothing;
  v_first := found;

  if v_first then
    v_xp := v_mission.reward_xp;
    v_ets := case when v_xp > 0 then greatest(1, round(v_xp::numeric / 20)::bigint) else 0 end;
    v_stars := v_mission.reward_stars;

    insert into public.player_balances(user_id, xp, ets, stars)
    values (p_user_id, v_xp, v_ets, v_stars)
    on conflict (user_id) do update
      set xp = public.player_balances.xp + excluded.xp,
          ets = public.player_balances.ets + excluded.ets,
          stars = public.player_balances.stars + excluded.stars,
          updated_at = now();

    if v_xp > 0 then
      insert into public.economy_ledger(user_id, asset, amount, reason, source_type, source_id, attempt_id)
      values (p_user_id, 'xp', v_xp, 'mission_first_completion', 'mission', p_mission_id, p_attempt_id);
    end if;
    if v_ets > 0 then
      insert into public.economy_ledger(user_id, asset, amount, reason, source_type, source_id, attempt_id)
      values (p_user_id, 'ets', v_ets, 'mission_first_completion', 'mission', p_mission_id, p_attempt_id);
    end if;
    if v_stars > 0 then
      insert into public.economy_ledger(user_id, asset, amount, reason, source_type, source_id, attempt_id)
      values (p_user_id, 'stars', v_stars, 'mission_first_completion', 'mission', p_mission_id, p_attempt_id);
    end if;
  end if;

  insert into public.player_balances(user_id) values (p_user_id)
  on conflict (user_id) do nothing;

  select * into v_balance from public.player_balances where user_id = p_user_id;

  return query select v_first, v_xp, v_ets, v_stars, v_balance.xp, v_balance.ets, v_balance.stars;
end;
$$;

-- This function is a privileged server boundary, not a browser RPC.
revoke all on function public.finalize_validated_mission_attempt(uuid, text, uuid, jsonb) from public;
revoke all on function public.finalize_validated_mission_attempt(uuid, text, uuid, jsonb) from anon;
revoke all on function public.finalize_validated_mission_attempt(uuid, text, uuid, jsonb) from authenticated;
grant execute on function public.finalize_validated_mission_attempt(uuid, text, uuid, jsonb) to service_role;
