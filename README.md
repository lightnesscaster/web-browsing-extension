# Zen YouTube Cleaner

A minimalist WebExtension that hides distracting recommendation surfaces on YouTube when using the Zen browser (or any Firefox-based browser).

## Features
- Removes the right-hand "Up next" sidebar and related video shelves.
- Suppresses end-of-video overlays, autoplay panels, and call-to-action cards.
- Automatically re-applies the clean layout as YouTube navigates between videos without full page reloads.

## Install (Zen Browser / Firefox family)
1. Clone or download this folder locally.
2. Open `about:debugging#/runtime/this-firefox` in Zen.
3. Click **Load Temporary Add-on…** and select the `manifest.json` file inside this project.
4. Play any YouTube video – the sidebar and endscreens should be gone.

> Loading an extension this way is temporary; Zen will unload it on restart. To keep it permanently you can package and sign it through Mozilla Add-ons, or re-load it whenever you start the browser.

## Tweaking the selectors
If YouTube changes its layout, adjust the CSS selectors in `scripts/hideSuggestions.js`. The extension watches for DOM updates, so adding new selectors is usually enough.

## Using it in other browsers
- **Chromium (Chrome, Edge, Brave, Vivaldi)**: The same manifest works. Visit `chrome://extensions`, enable Developer Mode, and use **Load unpacked**.
- **Standard Firefox**: Identical to the Zen steps above.
- **Safari**: Use Xcode's “Convert Web Extension” flow to wrap this project; Apple will bundle it into a native extension container.

## Extending the idea
Add more CSS (or script logic) to hide other distracting UI pieces—e.g., the home feed, comments, or shorts shelf—or expose a popup UI to toggle them on/off. The current build keeps things lightweight by relying on a single injected stylesheet.
