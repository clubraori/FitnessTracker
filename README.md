# Blockkeeper Daily

A today-first fitness tracker that generates one adaptive workout per day, logs your sets, and can optionally sync across devices.

## What it does

- Opens on a single “what am I doing today?” home screen
- Generates a fresh workout based on what you actually trained recently
- Keeps set, rep, weight, cardio, weigh-in, and weekly photo check-in logging
- Lets you swap today’s lifting plan for an outdoor detour like a run or social sport
- Starts a rest timer when you check off a set
- Keeps the timer hidden until it is active, and collapses it into a smaller control on phones
- Saves everything locally in the browser by default
- Supports export and import backups
- Supports optional Supabase sync with email magic-link sign-in for cross-device use
- Works as a static web app on GitHub Pages

## Files

- `index.html`
- `styles.css`
- `app.js`
- `manifest.webmanifest`
- `sw.js`
- `icon.svg`
- `SUPABASE_SETUP.md`
- `supabase_setup.sql`

## How to open it

Best option on your Mac:

- Double-click `start_tracker.command`
- It starts a local server and opens the app in your browser

Terminal option:

- From this folder, run:

```bash
python3 -m http.server 4173 --bind 127.0.0.1
```

- Then open:

`http://127.0.0.1:4173`

To stop the one-click server later:

- Double-click `stop_tracker.command`

## Using it on your phone

- Publish this repo to GitHub
- Keep the `main` branch and the included Pages workflow
- In GitHub, make sure Pages is allowed to deploy from GitHub Actions if prompted
- Open the Pages URL on your phone
- Add it to your home screen if you want it to feel more app-like
- If you want the same data on phone and laptop, enable the optional Supabase sync

## Storage modes

- Local-only mode works immediately and stores everything in the browser on the device you use
- Cloud sync is optional and uses Supabase plus email magic-link sign-in
- If you stay local-only, use `Export backup` and `Import backup` to move your data between devices
- If you want cloud sync, follow [SUPABASE_SETUP.md](SUPABASE_SETUP.md) and run [supabase_setup.sql](supabase_setup.sql)

## Notes

- The workout generator only learns from sessions you actually logged, not just plans that were generated.
- If a suggested set is off, change it and the generator will build from that next time the same movement comes up.
- Photos are compressed before saving so they fit better on mobile browsers.
- If your browser blocks local storage for local files, use `start_tracker.command` instead of opening the file directly.
