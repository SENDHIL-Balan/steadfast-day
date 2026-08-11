/**
 * Single guarded service-worker registration wrapper.
 * Offline support is required for this app, but the worker must never run in
 * dev or inside the Lovable preview iframe, where it would serve stale HTML.
 */

const SW_URL = "/sw.js";

function isPreviewHost(hostname: string) {
  return (
    hostname.startsWith("id-preview--") ||
    hostname.startsWith("preview--") ||
    hostname === "lovableproject.com" ||
    hostname.endsWith(".lovableproject.com") ||
    hostname === "lovableproject-dev.com" ||
    hostname.endsWith(".lovableproject-dev.com") ||
    hostname === "beta.lovable.dev" ||
    hostname.endsWith(".beta.lovable.dev")
  );
}

async function unregisterAppWorker() {
  if (!("serviceWorker" in navigator)) return;
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(
    registrations
      .filter((registration) => {
        const script =
          registration.active?.scriptURL ??
          registration.waiting?.scriptURL ??
          registration.installing?.scriptURL ??
          "";
        return script.endsWith(SW_URL);
      })
      .map((registration) => registration.unregister()),
  );

  // A worker from an older build can keep serving stale/broken responses and
  // make the page look frozen, so drop its caches as well as its registration.
  if ("caches" in window) {
    const keys = await caches.keys();
    await Promise.all(
      keys.filter((key) => key.startsWith("discipline-")).map((key) => caches.delete(key)),
    );
  }
}

export function registerServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

  const inIframe = window.self !== window.top;
  const swOff = new URL(window.location.href).searchParams.get("sw") === "off";
  // Inside an Android/iOS WebView the app is served from file:// or
  // capacitor://, where service workers are unsupported and registering throws.
  const unsupportedOrigin = !["https:", "http:"].includes(window.location.protocol);
  const refused =
    !import.meta.env.PROD ||
    inIframe ||
    swOff ||
    unsupportedOrigin ||
    isPreviewHost(window.location.hostname);

  if (refused) {
    void unregisterAppWorker();
    return;
  }


  const register = () => {
    navigator.serviceWorker.register(SW_URL).catch((error) => {
      console.error("Service worker registration failed", error);
    });
  };

  // Registration runs from a post-hydration effect, so the window "load" event
  // has usually already fired — waiting for it would never register.
  if (document.readyState === "complete") {
    register();
  } else {
    window.addEventListener("load", register, { once: true });
  }
}
