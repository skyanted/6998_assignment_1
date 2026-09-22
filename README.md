This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Assignment 2: Supabase profiles

The original Hello World content is retained, with a link to `/profiles` for the database list.

1. Run `supabase/profiles.sql` once in your Supabase project's SQL Editor. It creates
   fictional user profiles and grants the anonymous role read-only access with RLS.
2. Create `.env.local` in the project root with these environment variables:

   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL=<your Supabase project URL>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your Supabase anon key>
   ```

   Use the anon key, never a service-role or secret key. `.env.local` is ignored
   by Git; do not commit it.
3. Run `npm install`, then `npm run dev`, and open `http://localhost:3000/profiles`.
   Confirm that the four profile cards appear.
4. Run `npm run lint` and `npm run build` before committing. Check `git status`
   and `git ls-files '.env*'` to confirm no environment files are tracked.
5. Add the same two environment variables to the existing Vercel project for
   the deployment's environment, then deploy the new GitHub commit.
6. Check deployment protection and open the deployment-specific URL followed
   by `/profiles` in an Incognito window. Verify its source commit matches the
   pushed commit, and submit that deployment-specific URL.
