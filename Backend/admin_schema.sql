alter table users
add column if not exists assigned_employee_id text,
add column if not exists address text,
add column if not exists city text,
add column if not exists state text,
add column if not exists pincode text;

create index if not exists idx_users_assigned_employee_id
on users (assigned_employee_id);

alter table employees
add column if not exists address text,
add column if not exists city text,
add column if not exists state text,
add column if not exists pincode text;

-- If pincode was created as integer earlier, coerce it to text.
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'users'
      and column_name = 'pincode'
      and data_type <> 'text'
  ) then
    alter table users alter column pincode type text using pincode::text;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'employees'
      and column_name = 'pincode'
      and data_type <> 'text'
  ) then
    alter table employees alter column pincode type text using pincode::text;
  end if;
end $$;

notify pgrst, 'reload schema';
