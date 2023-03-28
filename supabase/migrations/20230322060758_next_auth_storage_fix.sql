/**
* TEMPORARY FIX TO MAKE next-auth work with Storage
* When uploading a file the owner (JWT sub) needs to exist in auth.users.
* Trigger to copy all users signed up with NextAuth into Supabase Auth.
*/ 

create function public.handle_new_user() 
returns trigger as $$
begin
  insert into auth.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;
create trigger on_auth_user_created
  after insert on next_auth.users
  for each row execute procedure public.handle_new_user();