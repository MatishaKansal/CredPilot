alter table users
add column if not exists assigned_employee_id text;

create index if not exists idx_users_assigned_employee_id
on users (assigned_employee_id);

alter table employees
add column if not exists address text,
add column if not exists city text,
add column if not exists state text,
add column if not exists pincode text;

notify pgrst, 'reload schema';
