const bcrypt = require("bcryptjs");
const { getDb } = require("./_lib/db");
const {
  parseBody,
  normalizeEmail,
  setAuthCookie,
  signToken,
} = require("./_lib/auth");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, password, viewItems } = parseBody(req);
    const emailLower = normalizeEmail(email);

    if (!emailLower || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
    }

    const db = await getDb();
    const usersCollection = db.collection("users");

    const existingUser = await usersCollection.findOne({ emailLower });
    if (existingUser) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const safeViewItems = Array.isArray(viewItems) ? viewItems : [];

    const insertResult = await usersCollection.insertOne({
      email: emailLower,
      emailLower,
      passwordHash,
      viewItems: safeViewItems,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const token = signToken({
      userId: insertResult.insertedId.toString(),
      email: emailLower,
    });

    setAuthCookie(res, token);

    return res.status(201).json({
      email: emailLower,
      viewItems: safeViewItems,
    });
  } catch (error) {
    return res.status(500).json({ error: "Registration failed" });
  }
};
