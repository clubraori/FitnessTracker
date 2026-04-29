# Blockkeeper Fitness Tracker

A self-contained workout tracker for your 3-week, 5-day recomp block.

## What it does

- Preloads all 5 weekly training sessions for 3 weeks
- Prefills target sets, reps, and starter load suggestions
- Lets you log target and actual weight/reps per set
- Reacts to changes so later weeks update from what you entered earlier
- Starts a rest timer when you check off a set
- Tracks cardio minutes, weigh-ins, steps, waist, and weekly energy
- Includes a Sunday photo check-in for each week
- Saves everything locally in the browser/device you use
- Supports export and import backups
- Is ready to host as a phone-friendly static web app on GitHub Pages

## Files

- `index.html`
- `styles.css`
- `app.js`
- `manifest.webmanifest`
- `sw.js`
- `icon.svg`

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

## Storage notes

- Workout data is stored in the browser on the device you use
- That means your phone will remember its own data, but it will not automatically sync with another device
- Use `Export backup` and `Import backup` if you want to move your data between devices

## Notes

- The week 1 load suggestions are just a starting estimate based on your body weight and exercise type.
- If a suggested set is off, change it once and the later weeks will adapt.
- Photos are compressed before saving so they fit better on mobile browsers.
- If your browser blocks local storage for local files, use `start_tracker.command` instead of opening the file directly.
