insert into storage.buckets
  (id, name, public)
values
  ('rooms', 'rooms', true);

-- Allow public access
create policy "Public Access" on storage.objects 
  for select using ( bucket_id = 'rooms' );

-- Allow authenticated uploads
create policy "Logged in user can upload." on storage.objects
  for insert to authenticated with check (bucket_id = 'rooms');