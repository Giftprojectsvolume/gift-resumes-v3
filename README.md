# Gift Resumes

South African CV and cover letter builder.

Live: https://gift-resumes-v3.vercel.app

## Setup

Stack: React + Vite, deployed on Vercel, with Supabase (Postgres, Auth, Edge Functions).

1. Install packages: `npm install`
2. Copy `.env.example` to `.env` and fill in:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_PAYSTACK_PUBLIC_KEY`
3. Run locally: `npm run dev`
4. Build: `npm run build`

Pushing to `main` deploys automatically on Vercel.

## What's built so far

- Signup and login
- CV editor with all 8 sections, autosave, reorder and duplicate
- 4 CV templates, live preview and PDF download
- Cover letter editor with 4 templates, preview and PDF
- ATS / readability check
- Import existing CV (PDF or Word) via the `import-cv` Edge Function
- AI wording improvement via the `improve-wording` Edge Function
- Pricing page, loaded from the products table
- Paystack payments (test mode)
- Job Leads: browse, detail page, report a job
- Admin Dashboard: users, purchases, revenue, job moderation, reports
- Account page and Help page

## Notes

- Paystack is still in test mode, pending approval for live payments.
- Edge Function secrets (Paystack, Anthropic, Supabase service role) are set in Supabase, never in this repo.
- Planned for later: CV photo scanner, public employer job submission, in-app featured job payments, Annual Career Plan billing, forgot password.
