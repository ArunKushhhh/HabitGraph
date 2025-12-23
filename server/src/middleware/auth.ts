import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "./errorHandler";
import User, { IUser } from "../models/User";

export interface AuthRequest extends Request {
  user?: IUser;
}

interface JwtPayload {
  userId: string;
  iat: number;
  exp: number;
}

export const protect = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      throw new ApiError("Not authorized - No token provided", 401);
    }

    // Verify token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new ApiError("JWT_SECRET not configured", 500);
    }

    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

    // Get user from token
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new ApiError("Not authorized - User not found", 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new ApiError("Not authorized - Invalid token", 401));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new ApiError("Not authorized - Token expired", 401));
    } else {
      next(error);
    }
  }
};

// Generate access token (short-lived)
export const generateAccessToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not configured");

  return jwt.sign({ userId }, secret, { expiresIn: "15m" });
};

// Generate refresh token (long-lived)
export const generateRefreshToken = (userId: string): string => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) throw new Error("JWT_REFRESH_SECRET not configured");

  return jwt.sign({ userId }, secret, { expiresIn: "7d" });
};

// Verify refresh token
export const verifyRefreshToken = (token: string): JwtPayload => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) throw new Error("JWT_REFRESH_SECRET not configured");

  return jwt.verify(token, secret) as JwtPayload;
};
