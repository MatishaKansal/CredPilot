create table if not exists loan_applications (
  application_id text primary key,
  user_id text not null,
  status text not null default 'pending',

  full_name text,
  date_of_birth date,
  gender text,
  marital_status text,
  num_children integer default 0,
  education_level text,
  phone_number text,
  address text,

  employment_type text,
  years_employed numeric,
  monthly_income numeric,
  owns_car boolean default false,
  owns_house boolean default false,
  region_type text,

  loan_amount numeric,
  loan_purpose text,
  tenure_months integer,

  has_past_loans boolean default false,
  num_past_loans integer default 0,
  had_late_payments boolean default false,
  existing_outstanding_debt numeric,

  assigned_employee_id text,
  created_at timestamptz default now()
);

create index if not exists idx_loan_applications_user_id
on loan_applications (user_id);

create index if not exists idx_loan_applications_status
on loan_applications (status);

create index if not exists idx_loan_applications_assigned_employee_id
on loan_applications (assigned_employee_id);

alter table loan_applications
add column if not exists assigned_employee_id text;

notify pgrst, 'reload schema';
