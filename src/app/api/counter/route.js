import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const doc = await db.collection("stats").findOne({ key: "globalCounter" });

    return Response.json({
      count: doc?.value ?? 0,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
