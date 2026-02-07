import clientPromise from "@/lib/mongodb";
import { pusherServer } from "@/lib/pusher-server";

async function incrementCounter() {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);

  const result = await db
    .collection("stats")
    .findOneAndUpdate(
      { key: "globalCounter" },
      { $inc: { value: 1 } },
      { upsert: true, returnDocument: "after" },
    );
  console.log(result);

  const newCount = result.value ?? 0;
  await pusherServer.trigger("global-counter", "updated", {
    count: newCount,
  });

  return newCount;
}

export async function POST() {
  try {
    const newCount = await incrementCounter();
    return Response.json({ count: newCount });
  } catch (error) {
    console.error("Error incrementing counter:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const newCount = await incrementCounter();
    return Response.json({ count: newCount });
  } catch (error) {
    console.error("Error incrementing counter:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
