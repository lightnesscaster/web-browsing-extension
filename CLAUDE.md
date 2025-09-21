# Zen YouTube Cleaner - Claude Code Documentation

## Project Overview
A web extension for Zen Browser (Firefox-based) that removes YouTube distractions and replaces the homepage with an interactive ASCII zen garden. The extension blocks video suggestions, sidebar recommendations, and end-screen overlays while providing a meditative homepage experience.

## Key Features
1. **Suggestion Blocking**: Hides YouTube homepage video grid and sidebar recommendations
2. **Video Metadata Hover**: Title, likes, and comments hidden by default, shown on hover
3. **Zen Garden**: Interactive ASCII art garden on homepage with ripples, stones, and rake patterns
4. **Memory Safe**: Proper cleanup of intervals, observers, and event listeners

## Project Structure
```
web_browsing_extension/
├── manifest.json           # Extension manifest (Manifest V3)
├── scripts/
│   ├── hideSuggestions.js # Main blocking logic and styles
│   └── zenGarden.js       # Interactive zen garden implementation
└── web-ext-artifacts/     # Built extension packages (.xpi files)
```

## Development Commands
```bash
# Build the extension
web-ext build --overwrite-dest && mv web-ext-artifacts/zen_youtube_cleaner-0.1.0.zip web-ext-artifacts/zen_youtube_cleaner-0.1.0.xpi

# Install web-ext tool (if not installed)
npm install --global web-ext
```

## Testing & Installation

### Temporary Installation (for testing)
1. Open Zen Browser
2. Navigate to `about:debugging`
3. Click "This Firefox" in sidebar
4. Click "Load Temporary Add-on..."
5. Select `manifest.json` from this directory

### Permanent Installation
1. Build the extension: `web-ext build --overwrite-dest`
2. Rename output: `mv web-ext-artifacts/zen_youtube_cleaner-0.1.0.zip web-ext-artifacts/zen_youtube_cleaner-0.1.0.xpi`
3. In Zen Browser, go to `about:config`
4. Set `xpinstall.signatures.required` to `false`
5. Go to `about:addons`
6. Click gear icon ⚙️ → "Install Add-on From File..."
7. Select the `.xpi` file from `web-ext-artifacts/`

## Code Quality Standards

### Before committing changes, ensure:
- No memory leaks (proper cleanup of intervals, observers, listeners)
- Boundary validation for all user inputs and calculations
- Performance optimizations for rendering loops
- CSS selectors are specific to avoid unintended hiding

### Key Implementation Details

#### Memory Management (zenGarden.js)
- All intervals stored in `gardenState.animationInterval`
- MutationObserver stored in `gardenState.observer`
- Event listeners tracked in `gardenState.eventListeners[]`
- Cleanup function `cleanupGarden()` removes all resources

#### Performance Optimizations
- Stone rendering uses Map for O(1) lookups instead of nested loops
- Debounced style injection in hideSuggestions.js
- Targeted MutationObserver on YouTube app containers only

#### CSS Targeting
- Homepage-only selectors: `ytd-browse[page-subtype="home"] .selector`
- Video page metadata: `#below`, `ytd-watch-metadata`, `#comments`
- Hover states use `:focus-within` for keyboard accessibility

## Known Edge Cases
1. Very small viewports may create gardens with dimensions < 10x5
2. YouTube DOM structure changes may require selector updates
3. Zen Browser updates may affect extension compatibility

## Future Enhancements
- Add user settings/preferences UI
- Allow customization of zen garden patterns
- Add more interactive elements to the garden
- Support for YouTube Shorts and other page types

## Debugging Tips
- Check console for errors: F12 → Console
- Verify extension loaded: `about:debugging` → check for "Zen YouTube Cleaner"
- Test selectors: Use browser DevTools to verify YouTube element selectors still match
- Memory leaks: Check DevTools Performance tab for increasing memory usage

## Browser Compatibility
- **Primary**: Zen Browser (Firefox-based)
- **Secondary**: Firefox (should work with minor adjustments)
- **Not Supported**: Chrome/Chromium (would need Manifest V3 adjustments)