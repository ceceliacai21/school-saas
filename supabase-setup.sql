-- Run this file once in Supabase Dashboard > SQL Editor.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  role text not null default 'student' check (role in ('admin', 'teacher', 'student', 'parent')),
  created_at timestamptz not null default now()
);

create table if not exists public.materials (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  grade text not null,
  category text not null check (category in (
    '图像记忆法',
    '思维导图记忆法',
    '记忆宫殿法',
    '大脑潜能训练',
    '思维能力训练'
  )),
  year integer not null check (year between 2000 and 2100),
  file_name text not null,
  storage_path text not null unique,
  notes text not null default '',
  uploaded_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.materials enable row level security;

grant usage on schema public to authenticated;
grant select on public.profiles to authenticated;
grant select, insert, delete on public.materials to authenticated;

create or replace function public.is_teaching_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role in ('admin', 'teacher')
  );
$$;

revoke all on function public.is_teaching_staff() from public;
grant execute on function public.is_teaching_staff() to authenticated;

drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile"
on public.profiles for select to authenticated
using (id = (select auth.uid()));

drop policy if exists "Authenticated users read materials" on public.materials;
create policy "Authenticated users read materials"
on public.materials for select to authenticated
using (true);

drop policy if exists "Staff create materials" on public.materials;
create policy "Staff create materials"
on public.materials for insert to authenticated
with check (
  public.is_teaching_staff()
  and uploaded_by = (select auth.uid())
);

drop policy if exists "Staff delete materials" on public.materials;
create policy "Staff delete materials"
on public.materials for delete to authenticated
using (public.is_teaching_staff());

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    'student'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

insert into public.profiles (id, display_name, role)
select
  id,
  coalesce(raw_user_meta_data ->> 'display_name', split_part(email, '@', 1)),
  'student'
from auth.users
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'course-materials',
  'course-materials',
  false,
  52428800,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Authenticated users read course files" on storage.objects;
create policy "Authenticated users read course files"
on storage.objects for select to authenticated
using (bucket_id = 'course-materials');

drop policy if exists "Staff upload course files" on storage.objects;
create policy "Staff upload course files"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'course-materials'
  and public.is_teaching_staff()
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

drop policy if exists "Staff delete course files" on storage.objects;
create policy "Staff delete course files"
on storage.objects for delete to authenticated
using (
  bucket_id = 'course-materials'
  and public.is_teaching_staff()
);

-- After creating your first user in Authentication > Users, promote it:
-- update public.profiles set role = 'admin', display_name = '周校长'
-- where id = (select id from auth.users where email = 'your-email@example.com');
