const jwt = require("jsonwebtoken");

const TOKEN_NAME = "todo_auth";
const TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function parseBody(req) {
  if (!req.body) {
    return {};
  }

  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch (error) {
      return {};
    }
  }

  return req.body;
}

function getCookieValue(req, name) {
  const cookieHeader = req.headers.cookie || "";
  const cookieParts = cookieHeader.split(";").map((item) => item.trim());
  const prefixedName = `${name}=`;
  const cookie = cookieParts.find((item) => item.startsWith(prefixedName));

  if (!cookie) {
    return "";
  }

  return decodeURIComponent(cookie.slice(prefixedName.length));
}

function signToken(payload) {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("Missing JWT_SECRET environment variable");
  }

  return jwt.sign(payload, jwtSecret, {
    expiresIn: TOKEN_MAX_AGE_SECONDS,
  });
}

function verifyToken(token) {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("Missing JWT_SECRET environment variable");
  }

  return jwt.verify(token, jwtSecret);
}

function setAuthCookie(res, token) {
  const secure = process.env.NODE_ENV === "production" ? "Secure; " : "";
  res.setHeader(
    "Set-Cookie",
    `${TOKEN_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; ${secure}Max-Age=${TOKEN_MAX_AGE_SECONDS}`,
  );
}

function clearAuthCookie(res) {
  const secure = process.env.NODE_ENV === "production" ? "Secure; " : "";
  res.setHeader(
    "Set-Cookie",
    `${TOKEN_NAME}=; Path=/; HttpOnly; SameSite=Lax; ${secure}Max-Age=0`,
  );
}

function getAuthPayload(req) {
  const token = getCookieValue(req, TOKEN_NAME);

  if (!token) {
    return null;
  }

  try {
    return verifyToken(token);
  } catch (error) {
    return null;
  }
}

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

module.exports = {
  parseBody,
  setAuthCookie,
  clearAuthCookie,
  signToken,
  getAuthPayload,
  normalizeEmail,
};
