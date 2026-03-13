const { ObjectId } = require("mongodb");
const { getDb } = require("./_lib/db");
const { getAuthPayload, parseBody } = require("./_lib/auth");

module.exports = async function handler(req, res) {
  const payload = getAuthPayload(req);

  if (!payload?.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const db = await getDb();
    const usersCollection = db.collection("users");
    const userObjectId = new ObjectId(payload.userId);

    if (req.method === "GET") {
      const user = await usersCollection.findOne(
        { _id: userObjectId },
        { projection: { viewItems: 1, email: 1 } },
      );

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.status(200).json({
        viewItems: Array.isArray(user.viewItems) ? user.viewItems : [],
      });
    }

    if (req.method === "POST") {
      const { viewItems } = parseBody(req);

      if (!Array.isArray(viewItems)) {
        return res.status(400).json({ error: "viewItems must be an array" });
      }

      await usersCollection.updateOne(
        { _id: userObjectId },
        {
          $set: {
            viewItems,
            updatedAt: new Date(),
          },
        },
      );

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    return res.status(500).json({ error: "Cloud sync failed" });
  }
};
