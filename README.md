# Gift Resumes — Frontend

## Setup

1. Run the six SQL migration files (schema → pricing → cost rates → auth trigger → dashboard functions → template slugs) in your Supabase project's SQL editor, if you haven't already.
2. `npm install`
3. Copy `.env.example` to `.env` and fill in your Supabase project URL and anon key (found in Supabase → Project Settings → API).
4. `npm run dev` and open the local URL it prints.

## What's built so far

- Sign up (`/signup`) and sign in (`/login`), backed by Supabase Auth
- Dashboard: plan status, My CVs (create/edit/preview/duplicate/delete), My Cover Letters (placeholder), My Purchases, Account/Help
- CV Editor: 8 sections (Personal Info, Summary, Work Experience, Education, Skills, Certifications, Languages, References) with autosave, add/edit/delete/reorder
- Template selection + live A4 preview across 4 templates (Clean Professional, ATS Friendly, Modern Professional, Entry Level)
- Client-side PDF via browser print — same renderer as the preview, real selectable text

## Notes

- Supabase's default setting requires email confirmation before a new account can log in. Toggle in Supabase → Authentication → Providers → Email if you want to skip that for testing.
- The `handle_new_user` trigger (from the SQL migrations) must be run, or new sign-ups will have no matching row in `profiles`.
