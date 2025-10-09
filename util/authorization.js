const jwt = require("jsonwebtoken");
const HTTPError = require("../util/http-error");
const jwtkey = process.env.JWT_KEY;

const verifyToken = (req, res) => {
  try {
    const token = req.cookies.token || null;
    if (!token) {
      res.status(401).json({ message: "Not authenticated" });
      return 0;
    }
    const { id, email, role } = jwt.verify(token, jwtkey);

    return { id, email, role };
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      res.status(401).json({ error: "Token expired. Please Login Again" });
    } else if (err.name === "JsonWebTokenError") {
      res.clearCookie("token");
      res.status(401).json({ error: "Invalid token. Please Login Again" });
    } else {
      res.clearCookie("token");
      next(new HTTPError("Verification Error. Please Login Again", 500, err));
    }
    return 0;
  }
};

module.exports = verifyToken;
