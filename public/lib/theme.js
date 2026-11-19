export const APPEARANCE_KEY = 'rezi.appearance.look';
export const MODERN_LOOKS = Object.freeze(['light', 'dark', 'high-contrast']);

const isModern = value => MODERN_LOOKS.includes(value);
const isPreference = value => value === 'current' || isModern(value);

/** Return a valid shared preference, or null. Cookie wins over origin storage. */
export function readPreference({ cookie = '', storage } = {}) {
  for (const entry of String(cookie ?? '').split(';')) {
    const separator = entry.indexOf('=');
    if (separator < 0 || entry.slice(0, separator).trim() !== APPEARANCE_KEY) continue;
    try {
      const value = decodeURIComponent(entry.slice(separator + 1));
      if (isPreference(value)) return value;
    } catch { /* A malformed cookie must not prevent the storage fallback. */ }
  }
  try {
    const value = storage?.getItem(APPEARANCE_KEY);
    return isPreference(value) ? value : null;
  } catch {
    return null;
  }
}

export function cookieDomain(hostname) {
  const host = String(hostname ?? '').toLowerCase();
  return host === 'dezrez.com' || host.endsWith('.dezrez.com') ? 'dezrez.com' : null;
}

/**
 * Standalone modern appearance. Shared Original remains an explicit Light
 * companion fallback; startup never rewrites it. A parent-applied frame theme
 * should use hostOwned: true so origin preferences cannot override its host.
 * portalOwned uses only the shared Dezrez cookie and never writes preferences.
 * Other standalone/mock hosts retain setLook and origin-local preferences.
 */
export function createThemeController({ document, window, onChange = () => {}, hostOwned = false, portalOwned = false, initialLook, fontSource = 'hosted' }) {
  if (!['hosted', 'bundled'].includes(fontSource)) throw new TypeError('Choose hosted Dezrez fonts or the bundled fallback fonts.');
  const portal = portalOwned && !hostOwned;
  let look = 'light';
  let sharedOriginal = false;
  let disposed = false;
  const cleanups = [];

  function storage() {
    try { return window.localStorage; } catch { return undefined; }
  }

  function preference() {
    if (portal && !cookieDomain(window.location.hostname)) return null;
    let cookie = '';
    try { cookie = document.cookie; } catch { /* Cookies may be blocked. */ }
    return readPreference({ cookie, ...(portal ? {} : { storage: storage() }) });
  }

  function listen(target, event, listener) {
    target.addEventListener(event, listener);
    cleanups.push(() => target.removeEventListener(event, listener));
  }

  async function verifyFonts() {
    if (disposed) return;
    try {
      if (!document.fonts?.load) return;
      const [headings, body] = await Promise.all([
        document.fonts.load(fontSource === 'bundled' ? '600 18px "Poppins"' : '600 18px "new-rubrik"'),
        document.fonts.load(fontSource === 'bundled' ? '400 14px "Exo 2"' : '400 14px "exo-soft"'),
      ]);
      await document.fonts.ready;
      if (disposed) return;
      const loaded = faces => Array.isArray(faces) && faces.length > 0 && faces.every(face => face.status === 'loaded');
      document.documentElement.dataset.fonts = loaded(headings) && loaded(body) ? fontSource === 'bundled' ? 'bundled' : 'rezi' : 'fallback';
    } catch {
      if (!disposed) document.documentElement.dataset.fonts = 'fallback';
    }
  }

  function ensureModernFonts() {
    document.documentElement.dataset.fontSource = fontSource;
    if (fontSource === 'bundled') {
      document.documentElement.dataset.fonts = 'fallback';
      void verifyFonts();
      return;
    }
    document.documentElement.dataset.fonts ||= 'fallback';
    let link = document.getElementById('rezi-modern-adobe-fonts');
    if (!link) {
      link = document.createElement('link');
      link.id = 'rezi-modern-adobe-fonts';
      link.rel = 'stylesheet';
      link.href = 'https://use.typekit.net/yis4cut.css';
      listen(link, 'load', verifyFonts);
      listen(link, 'error', () => {
        if (!disposed) document.documentElement.dataset.fonts = 'fallback';
      });
      document.head.appendChild(link);
    } else {
      listen(link, 'load', verifyFonts);
      listen(link, 'error', () => {
        if (!disposed) document.documentElement.dataset.fonts = 'fallback';
      });
      if (link.sheet) void verifyFonts();
    }
  }

  function apply(nextLook, original = false) {
    if (disposed) return;
    look = nextLook;
    sharedOriginal = original;
    document.body.setAttribute('data-rezi-modern', '');
    document.body.setAttribute('data-rezi-application-look', look);
    document.body.setAttribute('data-rezi-property-hub-look', look);
    // Keep the outer canvas/native controls aligned after the prepaint script.
    // Body custom properties do not inherit upward to the html background.
    if (document.documentElement.style) {
      const canvas = window.getComputedStyle?.(document.body).getPropertyValue('--rezi-modern-canvas').trim();
      if (canvas) document.documentElement.style.backgroundColor = canvas;
      document.documentElement.style.colorScheme = look === 'light' ? 'light' : 'dark';
    }
    onChange({ look, sharedOriginal });
  }

  function refresh() {
    if (disposed || hostOwned) return;
    const saved = preference();
    if (saved === null && !portal) return; // Mock hosts retain a usable in-memory choice.
    apply(saved === 'current' || saved === null ? 'light' : saved, saved === 'current');
  }

  function setLook(value, { persist = true } = {}) {
    if (disposed || portal || !isModern(value)) return false;
    if (persist && !hostOwned) {
      const domain = cookieDomain(window.location.hostname);
      const secure = window.location.protocol === 'https:' ? '; Secure' : '';
      try {
        document.cookie = `${APPEARANCE_KEY}=${encodeURIComponent(value)}${domain ? `; Domain=${domain}` : ''}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
      } catch { /* In-memory and origin-local selection remain usable. */ }
      try { storage()?.setItem(APPEARANCE_KEY, value); } catch { /* Storage may be blocked. */ }
    }
    apply(value);
    return true;
  }

  if (hostOwned) {
    const hinted = initialLook ?? document.body.getAttribute?.('data-rezi-application-look');
    apply(isModern(hinted) ? hinted : 'light');
  } else {
    const saved = preference();
    apply(saved === 'current' || saved === null ? 'light' : saved, saved === 'current');
  }
  ensureModernFonts();
  if (!hostOwned) {
    listen(window, 'focus', refresh);
    listen(document, 'visibilitychange', () => {
      if (!document.hidden) refresh();
    });
  }

  return {
    get look() { return look; },
    get sharedOriginal() { return sharedOriginal; },
    setLook,
    refresh,
    dispose() {
      if (disposed) return;
      disposed = true;
      for (const cleanup of cleanups) cleanup();
    },
  };
}
