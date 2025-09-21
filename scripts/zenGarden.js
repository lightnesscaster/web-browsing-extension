const ZEN_GARDEN_ID = "zen-youtube-garden";

const PATTERNS = [
  { char: '·', weight: 40 },
  { char: '∴', weight: 10 },
  { char: '∵', weight: 10 },
  { char: '⋅', weight: 15 },
  { char: '◦', weight: 8 },
  { char: '○', weight: 5 },
  { char: '◯', weight: 3 },
  { char: '⊙', weight: 2 },
  { char: '⊚', weight: 1 },
  { char: ' ', weight: 30 }
];

const STONE_PATTERNS = [
  { shape: ['◯'], weight: 5 },
  { shape: ['⊙'], weight: 3 },
  { shape: ['◉'], weight: 2 },
  { shape: ['⬤'], weight: 1 }
];

let gardenState = {
  width: 0,
  height: 0,
  grid: [],
  stones: [],
  ripples: [],
  time: 0,
  animationInterval: null,
  observer: null,
  eventListeners: [],
  isInjecting: false,
  injectionDebounceTimer: null
};

function getRandomPattern() {
  const totalWeight = PATTERNS.reduce((sum, p) => sum + p.weight, 0);
  let random = Math.random() * totalWeight;

  for (const pattern of PATTERNS) {
    random -= pattern.weight;
    if (random <= 0) return pattern.char;
  }
  return '·';
}

function initializeGarden(width, height) {
  gardenState.width = width;
  gardenState.height = height;
  gardenState.grid = [];

  for (let y = 0; y < height; y++) {
    const row = [];
    for (let x = 0; x < width; x++) {
      row.push(getRandomPattern());
    }
    gardenState.grid.push(row);
  }

  // Place random stones
  gardenState.stones = [];

  // Only place stones if garden is large enough
  if (width >= 15 && height >= 10) {
    const stoneCount = Math.floor(Math.random() * 3) + 2;

    for (let i = 0; i < stoneCount; i++) {
      const x = Math.floor(Math.random() * (width - 10)) + 5;
      const y = Math.floor(Math.random() * (height - 5)) + 2;
      const stone = STONE_PATTERNS[Math.floor(Math.random() * STONE_PATTERNS.length)];
      gardenState.stones.push({ x, y, shape: stone.shape[0] });
    }
  }
}

function createRipple(centerX, centerY, maxRadius) {
  gardenState.ripples.push({
    x: centerX,
    y: centerY,
    radius: 0,
    maxRadius: maxRadius,
    age: 0
  });
}

function updateRipples() {
  gardenState.ripples = gardenState.ripples.filter(ripple => {
    ripple.radius += 0.5;
    ripple.age++;
    return ripple.radius < ripple.maxRadius;
  });

  // Draw ripple patterns
  for (const ripple of gardenState.ripples) {
    const intensity = 1 - (ripple.radius / ripple.maxRadius);

    for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
      const x = Math.round(ripple.x + Math.cos(angle) * ripple.radius);
      const y = Math.round(ripple.y + Math.sin(angle) * ripple.radius);

      if (x >= 0 && x < gardenState.width && y >= 0 && y < gardenState.height) {
        if (Math.random() < intensity * 0.3) {
          const patterns = ['∴', '∵', '⋅'];
          gardenState.grid[y][x] = patterns[Math.floor(Math.random() * patterns.length)];
        }
      }
    }
  }
}

function rakePattern(startX, startY, direction) {
  const rakeWidth = 3;
  const rakeLength = 15;

  for (let i = 0; i < rakeLength; i++) {
    for (let j = -rakeWidth; j <= rakeWidth; j++) {
      let x, y;

      if (direction === 'horizontal') {
        x = startX + i;
        y = startY + j;
      } else {
        x = startX + j;
        y = startY + i;
      }

      if (x >= 0 && x < gardenState.width && y >= 0 && y < gardenState.height) {
        const distFromCenter = Math.abs(j);
        const char = distFromCenter === 0 ? '―' : distFromCenter === 1 ? '⋅' : '·';
        gardenState.grid[y][x] = char;
      }
    }
  }
}

function evolveGarden() {
  gardenState.time++;

  // Slowly fade patterns back to sand
  for (let y = 0; y < gardenState.height; y++) {
    for (let x = 0; x < gardenState.width; x++) {
      if (Math.random() < 0.01) {
        gardenState.grid[y][x] = getRandomPattern();
      }
    }
  }

  // Occasionally create ripples from stones
  for (const stone of gardenState.stones) {
    if (Math.random() < 0.005) {
      createRipple(stone.x, stone.y, 8 + Math.random() * 12);
    }
  }

  // Occasionally rake a pattern
  if (Math.random() < 0.01) {
    const x = Math.floor(Math.random() * gardenState.width);
    const y = Math.floor(Math.random() * gardenState.height);
    const direction = Math.random() < 0.5 ? 'horizontal' : 'vertical';
    rakePattern(x, y, direction);
  }

  updateRipples();
}

function renderGarden() {
  let output = [];

  // Create stone position map for O(1) lookups
  const stoneMap = new Map();
  for (const stone of gardenState.stones) {
    stoneMap.set(`${stone.x},${stone.y}`, stone);
  }

  for (let y = 0; y < gardenState.height; y++) {
    let row = '';
    for (let x = 0; x < gardenState.width; x++) {
      const stone = stoneMap.get(`${x},${y}`);
      if (stone) {
        row += stone.shape;
      } else {
        row += gardenState.grid[y][x];
      }
    }
    output.push(row);
  }

  return output.join('\n');
}

function createZenGardenElement() {
  const container = document.createElement('div');
  container.id = ZEN_GARDEN_ID;
  container.innerHTML = `
    <div class="zen-garden-container">
      <div class="zen-controls">
        <button class="zen-rake-btn" data-direction="horizontal">― Rake Horizontal</button>
        <button class="zen-rake-btn" data-direction="vertical">│ Rake Vertical</button>
        <button class="zen-ripple-btn">◯ Create Ripple</button>
        <button class="zen-reset-btn">↻ Reset Garden</button>
      </div>
      <pre class="zen-garden-display"></pre>
      <div class="zen-quote"></div>
    </div>
  `;

  return container;
}

const ZEN_QUOTES = [
  "Better to see the face than to hear the name.",
  "Those who know do not speak; those who speak do not know.",
  "If you try to change it, you will ruin it. Try to hold it, and you will lose it.",
  "The quieter you become, the more you can hear.",
  "To understand the limitation of things, desire them.",
  "True words aren't eloquent; eloquent words aren't true.",
  "The journey of a thousand miles begins with a single step.",
  "Be present above all else."
];

function getRandomQuote() {
  return ZEN_QUOTES[Math.floor(Math.random() * ZEN_QUOTES.length)];
}

// Debounced injection helper
function debouncedInjectZenGarden(delay = 100) {
  if (gardenState.injectionDebounceTimer) {
    clearTimeout(gardenState.injectionDebounceTimer);
  }

  gardenState.injectionDebounceTimer = setTimeout(() => {
    injectZenGarden();
    gardenState.injectionDebounceTimer = null;
  }, delay);
}

function cleanupGarden() {
  // Clear animation interval
  if (gardenState.animationInterval) {
    clearInterval(gardenState.animationInterval);
    gardenState.animationInterval = null;
  }

  // Clear debounce timer
  if (gardenState.injectionDebounceTimer) {
    clearTimeout(gardenState.injectionDebounceTimer);
    gardenState.injectionDebounceTimer = null;
  }

  // Disconnect observer
  if (gardenState.observer) {
    gardenState.observer.disconnect();
    gardenState.observer = null;
  }

  // Remove event listeners
  for (const { element, event, handler } of gardenState.eventListeners) {
    element.removeEventListener(event, handler);
  }
  gardenState.eventListeners = [];

  // Remove garden element
  const garden = document.getElementById(ZEN_GARDEN_ID);
  if (garden) {
    garden.remove();
  }

  // Reset injection flag
  gardenState.isInjecting = false;
}

function injectZenGarden(retryCount = 0) {
  // Prevent concurrent injections
  if (gardenState.isInjecting) {
    return;
  }

  // Check if we're on YouTube homepage
  if (window.location.pathname !== '/') {
    return;
  }

  // Check if garden already exists
  if (document.getElementById(ZEN_GARDEN_ID)) {
    return;
  }

  // Ensure clean state first
  if (gardenState.animationInterval || (gardenState.observer && gardenState.observer !== document.body)) {
    cleanupGarden();
  }

  gardenState.isInjecting = true;

  // Wait for YouTube to load - try multiple selectors
  let targetElement = document.querySelector('ytd-browse[page-subtype="home"] #primary');

  // Fallback: if page-subtype="home" not yet set, try YouTube-specific browse page
  if (!targetElement && window.location.pathname === '/') {
    targetElement = document.querySelector('ytd-browse #primary') ||
                    document.querySelector('ytd-app ytd-browse #primary');
  }

  if (!targetElement) {
    // Retry up to 5 times (1.5 seconds total) with pathway validation
    if (retryCount < 5 && window.location.pathname === '/') {
      setTimeout(() => {
        gardenState.isInjecting = false;
        injectZenGarden(retryCount + 1);
      }, 300);
    } else {
      gardenState.isInjecting = false;
    }
    return;
  }

  // Create and insert the garden
  const garden = createZenGardenElement();
  targetElement.appendChild(garden);

  // Initialize garden state
  const display = garden.querySelector('.zen-garden-display');
  const quote = garden.querySelector('.zen-quote');

  // Calculate dimensions based on viewport
  const charWidth = 8;
  const charHeight = 16;
  const width = Math.floor((window.innerWidth * 0.8) / charWidth);
  const height = Math.floor((window.innerHeight * 0.6) / charHeight);

  initializeGarden(width, height);
  display.textContent = renderGarden();
  quote.textContent = getRandomQuote();

  // Set up controls with proper event listener tracking
  garden.querySelectorAll('.zen-rake-btn').forEach(btn => {
    const handler = (e) => {
      const direction = e.target.dataset.direction;
      const x = Math.floor(Math.random() * gardenState.width);
      const y = Math.floor(Math.random() * gardenState.height);
      rakePattern(x, y, direction);
      display.textContent = renderGarden();
    };
    btn.addEventListener('click', handler);
    gardenState.eventListeners.push({ element: btn, event: 'click', handler });
  });

  const rippleBtn = garden.querySelector('.zen-ripple-btn');
  const rippleHandler = () => {
    const x = Math.max(0, Math.min(gardenState.width - 1,
      Math.floor(gardenState.width / 2 + (Math.random() - 0.5) * 20)));
    const y = Math.max(0, Math.min(gardenState.height - 1,
      Math.floor(gardenState.height / 2 + (Math.random() - 0.5) * 10)));
    createRipple(x, y, 15);
  };
  rippleBtn.addEventListener('click', rippleHandler);
  gardenState.eventListeners.push({ element: rippleBtn, event: 'click', handler: rippleHandler });

  const resetBtn = garden.querySelector('.zen-reset-btn');
  const resetHandler = () => {
    initializeGarden(width, height);
    display.textContent = renderGarden();
    quote.textContent = getRandomQuote();
  };
  resetBtn.addEventListener('click', resetHandler);
  gardenState.eventListeners.push({ element: resetBtn, event: 'click', handler: resetHandler });

  // Start animation loop with proper cleanup
  gardenState.animationInterval = setInterval(() => {
    evolveGarden();
    display.textContent = renderGarden();

    // Change quote occasionally
    if (Math.random() < 0.002) {
      quote.style.opacity = '0';
      setTimeout(() => {
        quote.textContent = getRandomQuote();
        quote.style.opacity = '1';
      }, 500);
    }
  }, 1000);

  // Mark injection as complete
  gardenState.isInjecting = false;
}

// Start the zen garden
injectZenGarden();

// Watch for YouTube navigation changes (SPA navigation)
let lastUrl = location.href;
gardenState.observer = new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    // URL changed, check if we're on homepage
    if (window.location.pathname === '/') {
      setTimeout(() => {
        injectZenGarden();
      }, 100);
    } else {
      cleanupGarden();
    }
  }

  // Also check for homepage content appearing
  if ((window.location.pathname === '/' || document.querySelector('ytd-browse[page-subtype="home"]')) && !document.getElementById(ZEN_GARDEN_ID)) {
    injectZenGarden();
  }
});

// Observe specific YouTube app container for better SPA navigation detection
const observeTarget = document.querySelector('ytd-app') || document.body;
gardenState.observer.observe(observeTarget, {
  childList: true,
  subtree: true
});

// Also listen for YouTube's custom navigation events
const ytNavigateHandler = () => {
  if (window.location.pathname === '/') {
    setTimeout(() => {
      injectZenGarden();
    }, 100);
  } else {
    cleanupGarden();
  }
};
window.addEventListener('yt-navigate-finish', ytNavigateHandler);
gardenState.eventListeners.push({ element: window, event: 'yt-navigate-finish', handler: ytNavigateHandler });

// Listen for YouTube's navigation start event (triggers on logo click)
const ytNavigateStartHandler = () => {
  // Clean up if navigating away from home
  if (window.location.pathname !== '/') {
    cleanupGarden();
  } else {
    // Check if navigating to homepage - use debounced injection
    debouncedInjectZenGarden(300);
  }
};
window.addEventListener('yt-navigate-start', ytNavigateStartHandler);
gardenState.eventListeners.push({ element: window, event: 'yt-navigate-start', handler: ytNavigateStartHandler });

// Listen for page data updates (more reliable for logo clicks from video pages)
const ytPageDataHandler = () => {
  if (window.location.pathname === '/' && !document.getElementById(ZEN_GARDEN_ID)) {
    // Longer delay for navigating from video pages - use debounced injection
    debouncedInjectZenGarden(400);
  }
};
window.addEventListener('yt-page-data-updated', ytPageDataHandler);
gardenState.eventListeners.push({ element: window, event: 'yt-page-data-updated', handler: ytPageDataHandler });

// Clean up on page unload
const beforeUnloadHandler = () => cleanupGarden();
window.addEventListener('beforeunload', beforeUnloadHandler);
gardenState.eventListeners.push({ element: window, event: 'beforeunload', handler: beforeUnloadHandler });