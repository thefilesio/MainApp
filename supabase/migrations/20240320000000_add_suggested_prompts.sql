-- Create suggested_prompts table
create table if not exists suggested_prompts (
  id uuid primary key default gen_random_uuid(),
  bot_id uuid references bots(id) on delete cascade,
  question text not null,
  fixed_response text,
  step integer not null default 3,
  context text,
  created_at timestamptz default now()
);

-- Add index for faster lookups
create index if not exists idx_suggested_prompts_bot_id on suggested_prompts(bot_id);

-- Add RLS policies
alter table suggested_prompts enable row level security;

create policy "Users can view their own bot's suggested prompts"
  on suggested_prompts for select
  using (
    bot_id in (
      select id from bots
      where user_id = auth.uid()
    )
  );

create policy "Users can insert suggested prompts for their bots"
  on suggested_prompts for insert
  with check (
    bot_id in (
      select id from bots
      where user_id = auth.uid()
    )
  );

create policy "Users can update their own bot's suggested prompts"
  on suggested_prompts for update
  using (
    bot_id in (
      select id from bots
      where user_id = auth.uid()
    )
  );

create policy "Users can delete their own bot's suggested prompts"
  on suggested_prompts for delete
  using (
    bot_id in (
      select id from bots
      where user_id = auth.uid()
    )
  ); 