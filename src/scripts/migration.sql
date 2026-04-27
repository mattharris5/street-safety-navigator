-- Run this in the Supabase SQL editor before running seed-community-corners.ts

ALTER TABLE projects ADD COLUMN IF NOT EXISTS sponsor text;
