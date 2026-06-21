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

  risk_score numeric,
  risk_level text,
  risk_recommendation text,
  risk_factors jsonb,
  review_notes text,
  reviewed_by text,
  reviewed_at timestamptz,

  created_at timestamptz default now()
);

create index if not exists idx_loan_applications_user_id
on loan_applications (user_id);

create index if not exists idx_loan_applications_status
on loan_applications (status);

-- Officer assignment lives on users.assigned_employee_id, not per application.
alter table loan_applications
drop column if exists assigned_employee_id;

drop index if exists idx_loan_applications_assigned_employee_id;

alter table loan_applications
add column if not exists risk_score numeric,
add column if not exists risk_level text,
add column if not exists risk_recommendation text,
add column if not exists risk_factors jsonb,
add column if not exists review_notes text,
add column if not exists reviewed_by text,
add column if not exists reviewed_at timestamptz;

notify pgrst, 'reload schema';
