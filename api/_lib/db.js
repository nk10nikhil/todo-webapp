const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || "my_todo_app";

let cachedClient;
let cachedDb;

async function getDb() {
  if (!uri) {
    throw new Error("Missing MONGODB_URI environment variable");
  }

  if (cachedDb) {
    return cachedDb;
  }

  if (!cachedClient) {
    cachedClient = new MongoClient(uri);
    await cachedClient.connect();
  }

  cachedDb = cachedClient.db(dbName);

  await cachedDb
    .collection("users")
    .createIndex({ emailLower: 1 }, { unique: true });

  return cachedDb;
}

module.exports = {
  getDb,
};
