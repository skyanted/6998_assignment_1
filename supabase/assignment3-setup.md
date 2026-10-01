# Assignment 3 setup

## Database

Run `supabase/assignment3.sql` in the existing Supabase project's SQL Editor.
This leaves Assignment 2's `public.profiles` unchanged, keeping old commit URLs
working. It creates Auth-linked `account.profiles` in the same database.
In Supabase Data API settings, add `account` to Exposed schemas without removing
the existing schemas. Server and browser Auth clients select the account schema.
Names start as NULL so the
application prompts new users to complete their profile.

The database migrations `supabase/posts.sql` and `supabase/profile-cards.sql`
were applied in order through MCP on 2026-10-01. The final table is
`public.profile_cards`: one personal introduction card per user, with bio, display name, and photo URL. Home reads these cards.
Home also reads and displays the four original fictional examples from
`public.profiles`; those remain separate from real users and are not editable
through Dashboard. Dashboard requires
login and creates the user's card on the first save, then updates it on later
saves. Profile name/photo changes also refresh the public card automatically.
The migration `supabase/profile-card-fields.sql` initially added username, descriptive
role/occupation, city, interests, and active status. Dashboard edits these fields
and previews the same card component used by Home. The descriptive role is never
used for authorization; edit permissions are based only on the authenticated UUID.
`supabase/profile-card-tag-limits.sql` limits interests to 3 tags and 20
characters per tag, enforced by both the save action and database constraints.

Profiles have owner-only SELECT/UPDATE policies. The `avatars` bucket allows
public viewing of profile photos; uploads and deletions are restricted to the
signed-in user's UUID folder. Each replacement updates `avatar_url` and removes
the previous uploaded object when possible. Images never enter Postgres rows.

## Google and Supabase Auth

1. In Google Cloud / Google Auth Platform, configure branding, audience, and
   the standard `openid`, email, and profile scopes. Create a Web application
   OAuth client. If the consent screen is in Testing mode, add the accounts
   that will test sign-in. Review audience settings before submission so the
   grader can sign in too.
2. Authorized JavaScript origins:
   - `http://localhost:3003` (the current local preview)
   - `https://6998-assignment-1.vercel.app`
3. Google Authorized redirect URI:
   `https://edxlpyxleyjlxfqcqulv.supabase.co/auth/v1/callback`
4. In Supabase Authentication > Providers > Google, enable Google and enter
   the OAuth Client ID and Client Secret. The secret belongs in Supabase's
   provider configuration, never in application source or NEXT_PUBLIC variables.
5. In Supabase Authentication > URL Configuration, use the existing Vercel
   production domain as Site URL and add these Redirect URLs:
   - `http://localhost:3003/auth/callback`
   - `https://6998-assignment-1.vercel.app/auth/callback`
   - The final deployment-specific URL followed by `/auth/callback` after deployment.
   If using another local port, register its callback as well.

The application always requests `${window.location.origin}/auth/callback`,
without custom query parameters. Supabase supplies the OAuth `code` on return;
the callback exchanges it for a cookie session and chooses Profile or Dashboard.

## Environment and validation

Keep the existing `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_ANON_KEY` variables in `.env.local` and Vercel.
No service-role key is required. Do not commit `.env.local`.

After database/provider configuration:

- Sign in with a new Google user: exactly one profiles row, ID matches auth.users.
- Confirm Profile prompts for both names; save them and visit Dashboard.
- Change names, refresh, and confirm persistence.
- Upload a JPEG/PNG/WebP up to 5 MB; replace it and confirm the updated photo.
- Sign out: Profile/Dashboard must stay on the requested route and show only
  a sign-in prompt with a clickable login link, never the protected editing forms.
- Sign in again: no duplicate profile row; completed profiles reach Dashboard.
- Check another account cannot update the first account's profile or avatar.
- Create a personal card in Dashboard and verify it appears on Home when signed out.
- Edit it, save, and verify the new bio appears with no duplicate row.
- Change Profile name/photo and verify the card reflects the changes.
- Check a different user cannot edit another user's card.

Commit/push only after the user reviews and authorizes it. Deploy the existing
Vercel project, verify deployment protection settings, register the deployment
callback, and test the commit-specific URL in an Incognito window.

`supabase/profile-card-email.sql` adds editable public contact emails to cards
and fictional example emails to the original samples. Home and Dashboard use
email instead of username. Original username fields remain for compatibility
with Assignment 2 deployments. Contact email does not change the login account.

`supabase/profile-card-remove-headline.sql` removes the unused headline field.
Dashboard and Home use the same card fields as the original examples.
