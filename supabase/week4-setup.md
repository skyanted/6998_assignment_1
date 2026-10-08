# Assignment 4 setup

Use the existing repository, Supabase project and Vercel project. Assignment 2/3
business tables remain unchanged. All week4 pages and images require sign-in.

## Current behavior

- Home defaults to Popular for upcoming and ongoing proposals. It sorts by net votes,
  then upvotes, publication time and ID; only its first three cards receive badges.
- Previous / Ongoing contains two horizontal rows: Upvoted tracks supported
  activities; All Previous lists ended or cancelled activities. Upvoted uses private persistent history,
  so withdrawing or switching a vote does not erase the activity from this view.
- Create / Mine generates drafts, publishes an activity and lets its organizer
  confirm hosting, edit details or cancel. Hosting is independent of ranking.
- Publishing requires a future start; dates are editable only before publication.
  Publishing one draft discards all that user's other unpublished drafts.
- Voting is open until the activity ends (start plus duration), unless cancelled.
  One current vote per user; switching and withdrawal update counts atomically.
- An activity is ongoing between its start and end and previous at its end.
  Hosting decisions cannot change after the end. Cancelled activities stay in history.
- There is no Wednesday cutoff, weekly winner or settlement cron job.
- Advanced format, area, interests and photo are optional checkbox controls.
  Unchecked choices do not constrain the AI. Uploaded photos participate in the
  prompt and become the cover; otherwise AI selects an existing database cover.

## Database

`week4.sql` defines the current fresh schema. The incremental changes already
applied to the existing project include `week4-organizer-hosting.sql`, which
removes the settlement job, makes legacy round links optional, adds organizer
hosting state and introduces owner-only `week4_upvote_history`.

Legacy week4 round records remain as historical metadata; new generations don't
use them. Business writes use authenticated RPCs with ownership checks. Every
week4 table has RLS. Uploaded images are in private Storage buckets and default
covers are private server assets served by authenticated endpoints.

## Environment variables

Keep these in ignored `.env.local` for local work and Vercel environment settings:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-publishable-key
GEMINI_API_KEY=your-server-only-key
GEMINI_MODEL=gemini-3.5-flash-lite
GOOGLE_MAPS_API_KEY=your-server-only-places-key
WEEK4_GENERATION_SECRET=your-existing-server-proof-secret
```

Do not change the generation proof secret without also updating its private
server-side hash. Do not commit `.env.local` or copy test account passwords to
Vercel. A separate free-tier Gemini project avoids inheriting Maps billing.

## OAuth and deployment

Keep old callbacks; add `http://localhost:3004/auth/callback` and each submitted
Vercel deployment's exact origin plus `/auth/callback` to Supabase Redirect URLs.
The app uses its current origin so old commit deployments stay on their own URL.
Disable Vercel deployment protection for grading; app sign-in remains required.

## Verification

`npm run test:week4` runs local database and component tests without provider
calls. It verifies ownership/RLS, generation proof, draft cleanup, future dates,
one vote per user, vote history, organizer decisions, cancellation/end boundaries,
Popular ranking, tracking filters and all sixteen advanced-option combinations.
Real provider tests are separate and should always have an explicit call cap.
Commit, push and deploy only when the user authorizes them.
