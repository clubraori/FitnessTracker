# Supabase Setup

The app now supports optional cloud sync so the same workouts, check-ins, and photos can follow you between devices.

## 1. Create a Supabase project

- Create a new Supabase project
- In `Project Settings` -> `API`, copy:
  - the project URL
  - the publishable / anon key

## 2. Run the SQL

- Open the SQL editor in Supabase
- Run the contents of [supabase_setup.sql](supabase_setup.sql)

This creates one row per signed-in user in `public.tracker_snapshots`, protected by RLS.

## 3. Expose the table to the Data API

- In Supabase, open the Data API integrations/settings area
- Make sure `public.tracker_snapshots` is exposed

The app uses `supabase-js` directly from the browser, so the table must be exposed there.

## 4. Configure auth redirect URLs

- In `Authentication` -> `URL Configuration`, add:
  - `https://clubraori.github.io/FitnessTracker/`
  - `http://127.0.0.1:4173/`
  - `http://127.0.0.1:4174/`

If you prefer another local port later, add that too.

## 5. Connect the app

- Open the app
- In the `Cloud sync` card, paste:
  - your Supabase URL
  - your publishable key
  - your email address
- Click `Save connection`
- Click `Email me a sign-in link`
- Open the magic link on the device you want to sync

## 6. How it behaves

- If a device has no meaningful local data yet, it will pull down your cloud snapshot after sign-in
- If a device already has local data, it keeps that version until you explicitly hit `Pull latest`
- `Sync now` pushes the current device state up to Supabase

## Notes

- This is still a static app hosted on GitHub Pages
- The Supabase publishable key is safe to use in the client; do not put a service role key in the app
- Photo check-ins are stored inside the synced snapshot JSON, so no separate storage bucket is required for now
