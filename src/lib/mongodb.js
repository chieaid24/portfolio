import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const options = {};

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
  throw new Error("Missing MONGODB_URI");
}

if (process.env.NODE_ENV === "development") {
  // In dev, use a global var so we don’t create many connections
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In prod, use a normal client
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
