// Lazy singleton. `new Pusher()` opens a WebSocket the moment it runs, and the
// old module-level instance meant every visitor connected on every page load
// (via the Header -> StarflareSection static import chain) even if the wallet
// was never opened. The dynamic import also keeps pusher-js out of the shared
// bundle — it loads as its own chunk on first call (wallet open).
let pusherPromise = null;

export function getPusherClient() {
  if (!pusherPromise) {
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

    if (!key || !cluster) {
      throw new Error("Missing NEXT_PUBLIC_PUSHER_* environment variables");
    }

    pusherPromise = import("pusher-js").then(
      ({ default: Pusher }) => new Pusher(key, { cluster }),
    );
  }
  return pusherPromise;
}
