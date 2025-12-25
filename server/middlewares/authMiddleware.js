const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    // 1️⃣ Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    // 2️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3️⃣ Attach user info to request
    req.user = {
      id: decoded.id,
      role: decoded.role
    };

    // 4️⃣ Continue
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
