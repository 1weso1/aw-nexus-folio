-- Create workflows tables and functions
create table if not exists workflows (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,                       -- url-safe (path hashed/encoded)
  name text not null,
  path text not null,
  raw_url text not null,
  size_bytes int4,
  updated_at timestamptz,
  category text default 'General',
  node_count int4 default 0,
  has_credentials boolean default false,
  complexity text check (complexity in ('Easy','Medium','Advanced')) default 'Easy',
  created_at timestamptz default now()
);

create table if not exists tags (
  id serial primary key,
  name text unique not null
);

create table if not exists workflow_tags (
  workflow_id uuid references workflows(id) on delete cascade,
  tag_id int references tags(id) on delete cascade,
  primary key (workflow_id, tag_id)
);

-- Add materialized search column
alter table workflows add column if not exists search_tsv tsvector;
create index if not exists idx_workflows_tsv on workflows using gin(search_tsv);
create index if not exists idx_workflows_category on workflows(category);
create index if not exists idx_workflows_updated_at on workflows(updated_at);

-- Enable RLS
alter table workflows enable row level security;
alter table tags enable row level security;
alter table workflow_tags enable row level security;

-- Public read access policies
create policy if not exists "public_read_workflows" on workflows
for select using (true);

create policy if not exists "public_read_tags" on tags
for select using (true);

create policy if not exists "public_read_workflow_tags" on workflow_tags
for select using (true);

-- Helper function to upsert a workflow + tags
create or replace function upsert_workflow(
  p_slug text, p_name text, p_path text, p_raw_url text,
  p_size int, p_updated timestamptz, p_category text,
  p_node_count int, p_has_credentials boolean, p_complexity text,
  p_tags text[]
) returns uuid
language plpgsql security definer as $$
declare 
  w_id uuid; 
  t text; 
  t_id int;
begin
  -- First delete existing tags for this workflow if updating
  if exists(select 1 from workflows where slug = p_slug) then
    delete from workflow_tags where workflow_id = (select id from workflows where slug = p_slug);
  end if;

  insert into workflows(slug,name,path,raw_url,size_bytes,updated_at,category,node_count,has_credentials,complexity,search_tsv)
  values(p_slug,p_name,p_path,p_raw_url,p_size,p_updated,coalesce(p_category,'General'),p_node_count,p_has_credentials,p_complexity,
         setweight(to_tsvector('simple', coalesce(p_name,'')), 'A') ||
         setweight(to_tsvector('simple', coalesce(p_category,'')), 'B'))
  on conflict(slug) do update set
    name=excluded.name, path=excluded.path, raw_url=excluded.raw_url, size_bytes=excluded.size_bytes,
    updated_at=excluded.updated_at, category=excluded.category, node_count=excluded.node_count,
    has_credentials=excluded.has_credentials, complexity=excluded.complexity,
    search_tsv=excluded.search_tsv
  returning id into w_id;

  if w_id is null then
    select id into w_id from workflows where slug=p_slug;
  end if;

  if p_tags is not null then
    foreach t in array p_tags loop
      if t is not null and trim(t) != '' then
        insert into tags(name) values (lower(trim(t))) on conflict(name) do nothing;
        select id into t_id from tags where name=lower(trim(t));
        insert into workflow_tags(workflow_id, tag_id) values (w_id, t_id)
        on conflict do nothing;
      end if;
    end loop;
  end if;

  return w_id;
end $$;