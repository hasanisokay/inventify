"use server";
import { MongoClient, ServerApiVersion } from "mongodb";
let db;
const dbConnect = async () => {
  
  if (db) return db;
  
  try {
    const uri = process.env.MONGO_URI;
    const client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        // strict: true,
        deprecationErrors: true,
      },
    });
    db = client.db("inventify");
    await client.db("admin").command({ ping: 1 });
    return db;
  } catch (e) {
    console.error(e.message);
  }
};

export default dbConnect;
