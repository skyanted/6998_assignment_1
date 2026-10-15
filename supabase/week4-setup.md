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

## Discovery UI revision

Apply `week4-discovery.sql` once to existing Week 4 databases. It adds a read-only public feed with an explicit display-field allowlist and published-cover access; base tables and personal records stay private. Signed-in users can generate before completing a profile; publishing still requires first and last name. The fresh-install `week4.sql` includes this revision.

Navigation is Home / Create / Mine. Home has Upcoming and Ongoing / Previous. Mine contains My activities, Upvoted, and Profile. Members is hidden. Legacy /dashboard, /profile and /previous routes forward to the matching current page.

OAuth always returns to the current origin's `/auth/callback`. `/auth/return` stores an allowlisted internal destination in a short-lived HttpOnly cookie, so login returns to the interrupted task without adding callback query parameters. Create stores idea/preferences in session storage before login; uploads require reselection. It never automatically generates or votes after login.

## Generation limits

Apply `week4-generation-limits.sql` after the earlier incremental scripts. Each account can start up to 20 generations in a rolling 24 hours, with at least 10 seconds between starts. Cooldown and daily-limit errors have separate messages. All attempts continue to count toward the daily limit. The fresh schema includes this update.

The preview’s Generate another button returns to the idea editor without calling AI. The user edits and explicitly presses Generate event to create another saved draft.

## Event detail access

Apply `week4-private-event-details.sql` after the earlier incremental scripts. The public feed returns only card previews: a shortened description, venue name and display/status fields. Hosting details, full addresses, map place IDs, budget and capacity are excluded. Event detail pages check the authenticated user on the server before fetching the full event. A logged-out visitor gets an in-page Sign in prompt, returning to that event after login. The fresh schema includes this update.
