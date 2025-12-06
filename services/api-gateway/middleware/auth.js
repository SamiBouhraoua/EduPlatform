import jwt from "jsonwebtoken";

export function isPublic(path, method) {
  if (path.startsWith("/auth") || path.startsWith("/login")) return true;

  if (path.startsWith("/colleges") && method === "GET") return true;
  if (path.startsWith("/colleges") && method === "POST") return true;

  return false;
}

export function authMiddleware(JWT_SECRET) {
  return (req, res, next) => {

    if (isPublic(req.path, req.method)) return next();

    const auth = req.headers.authorization;
    
    if (!auth) return res.status(401).json({ message: "Authorization header missing" });

    const token = auth.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Bearer token missing" });

    try {
      const payload = jwt.verify(token, JWT_SECRET);
      req.user = payload;
      req.userId = payload.userId;
    } catch (e) {
      return res.status(403).json({ message: "Invalid token" });
    }

    // Routes nécessitant un collegeId
    if (req.path.startsWith("/academic") || req.path.startsWith("/ia")) {
      const collegeId = req.headers["x-college-id"];
      if (!collegeId)
        return res.status(400).json({ message: "x-college-id header required" });

      req.collegeId = collegeId;
    }

    next();
  };
}
