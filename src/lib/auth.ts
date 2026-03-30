import jwt from "jsonwebtoken";

interface TokenPayload {
  userId: string;
  email: string;
  // any other user info you put in the JWT
}

export const verifyToken = (req: Request): TokenPayload => {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("No token provided");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
    return decoded;
  } catch (err) {
    throw new Error("Invalid token");
  }
};
