import clientPromise from "@/lib/mongodb";
import { pusherServer } from "@/lib/pusher-server";

export async function POST() {
  try {
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
    // broadcast to subscribers
    await pusherServer.trigger("global-counter", "updated", {
      count: newCount,
    });

    return Response.json({
      count: newCount, // updated number
    });
  } catch (error) {
    console.error("Error incrementing counter:", err);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
