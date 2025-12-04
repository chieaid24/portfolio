import Pusher from "pusher-js";

const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

if (!key || !cluster) {
  throw new Error("Missing NEXT_PUBLIC_PUSHER_* environment variables");
}

export const pusherClient = new Pusher(key, {
  cluster,
});
