-- Add bio column to profiles (run in Supabase SQL editor)
alter table profiles add column if not exists bio text;
