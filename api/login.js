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
    const { email, password } = parseBody(req);
    const emailLower = normalizeEmail(email);

    if (!emailLower || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const db = await getDb();
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ emailLower });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
    });

    setAuthCookie(res, token);

    return res.status(200).json({
      email: user.email,
      viewItems: Array.isArray(user.viewItems) ? user.viewItems : [],
    });
  } catch (error) {
    return res.status(500).json({ error: "Login failed" });
  }
};
