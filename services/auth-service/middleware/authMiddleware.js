import jwt from "jsonwebtoken";

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: "Token manquant." });

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev_secret_change_me");
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Token invalide." });
  }
}
