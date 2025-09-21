const STYLE_ID = "zen-youtube-cleaner-style";
const STYLE_RULES = `
  /* Hide homepage video grid and suggestions ONLY on homepage */
  ytd-browse[page-subtype="home"] ytd-rich-grid-renderer,
  ytd-browse[page-subtype="home"] ytd-rich-item-renderer,
  ytd-browse[page-subtype="home"] ytd-rich-section-renderer,
  ytd-browse[page-subtype="home"] ytd-rich-shelf-renderer,
  ytd-browse[page-subtype="home"] #contents.ytd-rich-grid-renderer,
  ytd-browse[page-subtype="home"] #primary > ytd-rich-grid-renderer {
    display: none !important;
  }

  /* Hide the right-hand related videos column */
  #secondary,
  ytd-watch-next-secondary-results-renderer,
  ytd-compact-autoplay-renderer,
  ytd-merch-shelf-renderer,
  ytd-badge-supported-renderer,
  ytd-vertical-list-renderer,
  ytd-compact-video-renderer,
  ytd-compact-promoted-video-renderer,
  ytd-shelf-renderer {
    display: none !important;
  }

  /* Hide Shorts on subscriptions page */
  ytd-browse[page-subtype="subscriptions"] ytd-reel-shelf-renderer,
  ytd-browse[page-subtype="subscriptions"] ytd-reel-item-renderer,
  ytd-browse[page-subtype="subscriptions"] ytd-rich-shelf-renderer[is-shorts],
  ytd-browse[page-subtype="subscriptions"] ytd-rich-section-renderer[is-shorts],
  ytd-browse[page-subtype="subscriptions"] ytd-video-preview[is-shorts],
  ytd-browse[page-subtype="subscriptions"] [aria-label="Shorts"],
  ytd-browse[page-subtype="subscriptions"] [aria-label^="Shorts shelf"],
  ytd-browse[page-subtype="subscriptions"] ytd-thumbnail[overlay-style="SHORTS"] {
    display: none !important;
  }

  /* Hide end screen suggestions and autoplay overlays */
  .ytp-autonav-endscreen-countdown-overlay,
  .ytp-autonav-endscreen-upnext,
  .ytp-endscreen-content,
  .ytp-endscreen-layout,
  .ytp-endscreen-clearfix,
  .ytp-autonav-toggle-button,
  .ytp-ce-element,
  .ytp-ce-video,
  .ytp-ce-website,
  .ytp-ce-element-show,
  .ytp-autonav-endscreen-click-target,
  .ytp-autonav-endscreen-suggestions,
  #related.ytd-watch-flexy {
    display: none !important;
  }

  /* Prevent player scrim from reintroducing overlays */
  .ytp-ce-element-show,
  .ytp-ce-covering-overlay,
  .ytp-autonav-endscreen-play-button {
    display: none !important;
  }

  /* Hide everything below video by default - simplified selectors */
  #below,
  ytd-watch-metadata,
  #comments {
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  /* Show on direct hover or focus for keyboard navigation */
  #below:hover,
  #below:focus-within,
  ytd-watch-metadata:hover,
  ytd-watch-metadata:focus-within,
  #comments:hover,
  #comments:focus-within {
    opacity: 1;
  }

  /* Ensure hover area is accessible */
  #below,
  ytd-watch-metadata,
  #comments {
    position: relative;
    pointer-events: auto;
  }

  /* Respect reduced motion preferences */
  @media (prefers-reduced-motion: reduce) {
    #below,
    ytd-watch-metadata,
    #comments {
      transition: none;
    }
  }

  /* Zen Garden Styles */
  #zen-youtube-garden {
    width: 100%;
    min-height: 80vh;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
    padding: 6rem 2rem 2rem 2rem;
    box-sizing: border-box;
  }

  .zen-garden-container {
    width: 100%;
    max-width: 1200px;
    text-align: center;
  }

  .zen-controls {
    margin-bottom: 2rem;
    display: flex;
    gap: 0.75rem;
    justify-content: center;
    flex-wrap: wrap;
    padding: 0 1rem;
  }

  .zen-controls button {
    padding: 0.6rem 1.2rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.7);
    border-radius: 8px;
    cursor: pointer;
    font-family: monospace;
    font-size: 14px;
    transition: all 0.3s ease;
  }

  .zen-controls button:hover {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.9);
    transform: translateY(-2px);
  }

  .zen-garden-display {
    font-family: 'Courier New', monospace;
    font-size: 14px;
    line-height: 1.2;
    color: rgba(255, 255, 255, 0.6);
    background: rgba(0, 0, 0, 0.3);
    padding: 2rem;
    border-radius: 12px;
    overflow: hidden;
    white-space: pre;
    letter-spacing: 0.2em;
    box-shadow: inset 0 0 50px rgba(0, 0, 0, 0.5);
  }

  .zen-quote {
    margin-top: 2rem;
    font-size: 18px;
    color: rgba(255, 255, 255, 0.5);
    font-style: italic;
    transition: opacity 0.5s ease;
    font-family: 'Georgia', serif;
    letter-spacing: 0.05em;
  }
`;

function injectStyle() {
  if (document.getElementById(STYLE_ID)) {
    return true;
  }

  const target = document.head || document.documentElement;
  if (!target) {
    return false;
  }

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = STYLE_RULES;
  target.appendChild(style);
  return true;
}

function ensureStylePresent() {
  if (!injectStyle()) {
    requestAnimationFrame(ensureStylePresent);
  }
}

ensureStylePresent();

// Debounce function to limit how often we check for style
let debounceTimer;
function debouncedInjectStyle() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    injectStyle();
  }, 100);
}

// Only observe specific YouTube app containers instead of entire document
const observer = new MutationObserver((mutations) => {
  // Only react if the style element was removed
  if (!document.getElementById(STYLE_ID)) {
    debouncedInjectStyle();
    return;
  }

  // Check if YouTube navigation occurred (new page load)
  for (const mutation of mutations) {
    if (mutation.type === 'childList' &&
        (mutation.target.id === 'content' ||
         mutation.target.tagName === 'YTD-APP' ||
         mutation.target.id === 'page-manager')) {
      debouncedInjectStyle();
      break;
    }
  }
});

// Start observing once YouTube app is loaded
function startObserving() {
  const ytApp = document.querySelector('ytd-app, #content, #page-manager');
  if (ytApp) {
    observer.observe(ytApp, {
      childList: true,
      subtree: true,
      // Don't observe attributes or character data - not needed
      attributes: false,
      characterData: false
    });
  } else {
    // YouTube app not loaded yet, retry
    setTimeout(startObserving, 500);
  }
}

startObserving();

window.addEventListener("beforeunload", () => {
  observer.disconnect();
  clearTimeout(debounceTimer);
});
