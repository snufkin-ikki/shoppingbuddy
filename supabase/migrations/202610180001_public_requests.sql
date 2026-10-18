-- Shopping Buddy: public request / application MVP foundation
-- Apply with Supabase CLI after configuring a project. This migration does not
-- configure Auth providers, Stripe, push notifications, or production secrets.

create extension if not exists pgcrypto;

create table if not exists public.public_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 40),
  age smallint check (age between 18 and 120),
  avatar_url text,
  bio text not null default '' check (char_length(bio) <= 500),
  rate_per_30m_yen integer check (rate_per_30m_yen is null or rate_per_30m_yen >= 500),
  updated_at timestamptz not null default now()
);

create table if not exists public.buddy_verifications (
  user_id uuid primary key references auth.users(id) on delete cascade,
  verified_at timestamptz not null default now(),
  verification_source text not null default 'manual'
);

create table if not exists public.public_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 80),
  description text not null default '' check (char_length(description) <= 2000),
  area text not null check (area in (
    '下北沢', '渋谷・原宿', '浅草・蔵前', '秋葉原', '神保町',
    '京都', '大阪・心斎橋', '名古屋・栄', '福岡・天神', '仙台', '札幌'
  )),
  category text not null check (category in ('衣', '美', '食', '住', '遊', '電')),
  scheduled_at timestamptz,
  duration_minutes smallint check (duration_minutes in (30, 60, 90, 120)),
  apply_deadline timestamptz not null,
  status text not null default 'open'
    check (status in ('open', 'matched', 'cancelled', 'expired')),
  selected_buddy_id uuid references auth.users(id),
  payment_status text not null default 'not_due'
    check (payment_status in ('not_due', 'pending', 'paid', 'refunded')),
  details_confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  check (apply_deadline > created_at),
  check ((status = 'matched') = (selected_buddy_id is not null))
);

create index if not exists public_requests_open_area_deadline_idx
  on public.public_requests (area, apply_deadline)
  where status = 'open';

create table if not exists public.request_private_details (
  request_id uuid primary key references public.public_requests(id) on delete cascade,
  meeting_point text not null check (char_length(meeting_point) <= 500),
  contact_notes text not null default '' check (char_length(contact_notes) <= 1000)
);

create table if not exists public.request_applications (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.public_requests(id) on delete cascade,
  buddy_id uuid not null references auth.users(id) on delete cascade,
  message text not null default '' check (char_length(message) <= 500),
  status text not null default 'pending'
    check (status in ('pending', 'selected', 'not_selected')),
  created_at timestamptz not null default now(),
  unique (request_id, buddy_id)
);

create index if not exists request_applications_request_created_idx
  on public.request_applications (request_id, created_at);

create table if not exists public.request_messages (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.public_requests(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists request_messages_request_created_idx
  on public.request_messages (request_id, created_at);

alter table public.public_profiles enable row level security;
alter table public.buddy_verifications enable row level security;
alter table public.public_requests enable row level security;
alter table public.request_private_details enable row level security;
alter table public.request_applications enable row level security;
alter table public.request_messages enable row level security;

-- Public visitors can read only the deliberately public profile fields.
create policy "public profiles are viewable"
  on public.public_profiles for select using (true);
create policy "users create own public profile"
  on public.public_profiles for insert to authenticated
  with check (user_id = auth.uid());
create policy "users update own public profile"
  on public.public_profiles for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Verification records are written by trusted service-side tooling only.
create policy "users read own verification"
  on public.buddy_verifications for select to authenticated
  using (user_id = auth.uid());

-- Browsing is public. Creation and applications require signed-in identities.
create policy "open public requests are viewable"
  on public.public_requests for select using (status = 'open' or requester_id = auth.uid());
create policy "users create own public requests"
  on public.public_requests for insert to authenticated
  with check (
    requester_id = auth.uid()
    and status = 'open'
    and selected_buddy_id is null
    and apply_deadline > now()
  );

create policy "requester stores private meeting details"
  on public.request_private_details for insert to authenticated
  with check (
    exists (
      select 1 from public.public_requests r
      where r.id = request_id and r.requester_id = auth.uid() and r.status = 'open'
    )
  );
create policy "matched parties read meeting details"
  on public.request_private_details for select to authenticated
  using (
    exists (
      select 1 from public.public_requests r
      where r.id = request_id
        and r.status = 'matched'
        and (r.requester_id = auth.uid() or r.selected_buddy_id = auth.uid())
    )
  );

create policy "requester and applicant read applications"
  on public.request_applications for select to authenticated
  using (
    buddy_id = auth.uid()
    or exists (
      select 1 from public.public_requests r
      where r.id = request_id and r.requester_id = auth.uid()
    )
  );
create policy "verified buddies apply to open requests"
  on public.request_applications for insert to authenticated
  with check (
    buddy_id = auth.uid()
    and status = 'pending'
    and exists (
      select 1 from public.buddy_verifications v
      where v.user_id = auth.uid()
    )
    and exists (
      select 1 from public.public_requests r
      where r.id = request_id
        and r.status = 'open'
        and r.apply_deadline > now()
        and r.requester_id <> auth.uid()
    )
  );

create policy "matched parties read request messages"
  on public.request_messages for select to authenticated
  using (
    exists (
      select 1 from public.public_requests r
      where r.id = request_id
        and r.status = 'matched'
        and (r.requester_id = auth.uid() or r.selected_buddy_id = auth.uid())
    )
  );
create policy "matched parties send request messages"
  on public.request_messages for insert to authenticated
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.public_requests r
      where r.id = request_id
        and r.status = 'matched'
        and (r.requester_id = auth.uid() or r.selected_buddy_id = auth.uid())
    )
  );

-- Explicit table grants keep the client surface limited to the intended operations.
grant select on public.public_profiles to anon, authenticated;
grant insert, update on public.public_profiles to authenticated;
grant select on public.public_requests to anon, authenticated;
grant insert on public.public_requests to authenticated;
grant select on public.request_private_details to authenticated;
grant insert on public.request_private_details to authenticated;
grant select, insert on public.request_applications to authenticated;
grant select, insert on public.request_messages to authenticated;
grant select on public.buddy_verifications to authenticated;

-- One atomic choice: the requester selects exactly one applicant.
create or replace function public.select_request_buddy(
  p_request_id uuid,
  p_application_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_buddy_id uuid;
begin
  select a.buddy_id into v_buddy_id
  from public.request_applications a
  join public.public_requests r on r.id = a.request_id
  where a.id = p_application_id
    and a.request_id = p_request_id
    and a.status = 'pending'
    and r.requester_id = auth.uid()
    and r.status = 'open'
  for update of r, a;

  if v_buddy_id is null then
    raise exception 'Request or application is not selectable';
  end if;

  update public.public_requests
  set status = 'matched',
      selected_buddy_id = v_buddy_id,
      payment_status = 'pending'
  where id = p_request_id and requester_id = auth.uid() and status = 'open';

  if not found then
    raise exception 'Request has already been closed';
  end if;

  update public.request_applications
  set status = case when id = p_application_id then 'selected' else 'not_selected' end
  where request_id = p_request_id;
end;
$$;

revoke all on function public.select_request_buddy(uuid, uuid) from public;
grant execute on function public.select_request_buddy(uuid, uuid) to authenticated;

-- The requester confirms the agreed schedule after chat; the server may then
-- create the Stripe checkout session. Stripe webhook code should mark payment
-- as paid; the mobile client receives no direct payment-status write access.
create or replace function public.confirm_public_request_details(
  p_request_id uuid,
  p_scheduled_at timestamptz,
  p_duration_minutes smallint
)
returns void
language plpgsql
security definer
set search_path = ''
as $
begin
  update public.public_requests
  set scheduled_at = p_scheduled_at,
      duration_minutes = p_duration_minutes,
      details_confirmed_at = now()
  where id = p_request_id
    and requester_id = auth.uid()
    and status = 'matched'
    and payment_status = 'pending';

  if not found then
    raise exception 'Request details cannot be confirmed';
  end if;
end;
$;

revoke all on function public.confirm_public_request_details(uuid, timestamptz, smallint) from public;
grant execute on function public.confirm_public_request_details(uuid, timestamptz, smallint) to authenticated;
