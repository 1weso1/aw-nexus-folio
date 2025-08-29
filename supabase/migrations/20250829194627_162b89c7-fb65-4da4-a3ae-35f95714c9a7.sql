-- Fix security issue: make function search path immutable
create or replace function upsert_workflow(
  p_slug text, p_name text, p_path text, p_raw_url text,
  p_size int, p_updated timestamptz, p_category text,
  p_node_count int, p_has_credentials boolean, p_complexity text,
  p_tags text[]
) returns uuid
language plpgsql 
security definer
set search_path = public
as $$
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