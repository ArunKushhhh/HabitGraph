import { Router, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
import { validate } from "../middleware/validate";
import { registerSchema, loginSchema } from "../schemas/auth.schema";
import {
  AuthRequest,
  protect,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../middleware/auth";
import { ApiError } from "../middleware/errorHandler";

const router = Router();

// Cookie options for refresh token
const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// POST /api/auth/register
router.post(
  "/register",
  validate(registerSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { email, password, name } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new ApiError("User with this email already exists", 400);
      }

      // Create new user
      const user = await User.create({ email, password, name });

      // Generate tokens
      const accessToken = generateAccessToken(user._id.toString());
      const refreshToken = generateRefreshToken(user._id.toString());

      // Hash and store refresh token
      const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
      user.refreshTokens = [hashedRefreshToken];
      await user.save();

      // Set refresh token as HTTP-only cookie
      res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
          },
          accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/auth/login
router.post(
  "/login",
  validate(loginSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      // Find user with password
      const user = await User.findOne({ email }).select(
        "+password +refreshTokens"
      );
      if (!user) {
        throw new ApiError("Invalid credentials", 401);
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        throw new ApiError("Invalid credentials", 401);
      }

      // Generate tokens
      const accessToken = generateAccessToken(user._id.toString());
      const refreshToken = generateRefreshToken(user._id.toString());

      // Hash and add new refresh token (multi-device support)
      const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
      user.refreshTokens.push(hashedRefreshToken);

      // Keep only last 5 refresh tokens per user
      if (user.refreshTokens.length > 5) {
        user.refreshTokens = user.refreshTokens.slice(-5);
      }
      await user.save();

      // Set refresh token as HTTP-only cookie
      res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);

      res.json({
        success: true,
        message: "Login successful",
        data: {
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
          },
          accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/auth/refresh
router.post(
  "/refresh",
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) {
        throw new ApiError("Refresh token not found", 401);
      }

      // Verify refresh token
      const decoded = verifyRefreshToken(refreshToken);

      // Find user
      const user = await User.findById(decoded.userId).select("+refreshTokens");
      if (!user) {
        throw new ApiError("User not found", 401);
      }

      // Check if refresh token exists in user's tokens
      const tokenExists = await Promise.all(
        user.refreshTokens.map((hashedToken) =>
          bcrypt.compare(refreshToken, hashedToken)
        )
      ).then((results) => results.some((result) => result));

      if (!tokenExists) {
        throw new ApiError("Invalid refresh token", 401);
      }

      // Generate new tokens
      const newAccessToken = generateAccessToken(user._id.toString());
      const newRefreshToken = generateRefreshToken(user._id.toString());

      // Replace old refresh token with new one
      const updatedTokens = await Promise.all(
        user.refreshTokens.map(async (hashedToken) => {
          const isMatch = await bcrypt.compare(refreshToken, hashedToken);
          if (isMatch) {
            return bcrypt.hash(newRefreshToken, 10);
          }
          return hashedToken;
        })
      );
      user.refreshTokens = updatedTokens;
      await user.save();

      // Set new refresh token cookie
      res.cookie("refreshToken", newRefreshToken, refreshTokenCookieOptions);

      res.json({
        success: true,
        data: {
          accessToken: newAccessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/auth/logout
router.post(
  "/logout",
  protect,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies?.refreshToken;

      if (refreshToken && req.user) {
        // Remove the refresh token from user's tokens
        const user = await User.findById(req.user._id).select("+refreshTokens");
        if (user) {
          user.refreshTokens = await Promise.all(
            user.refreshTokens.filter(async (hashedToken) => {
              const isMatch = await bcrypt.compare(refreshToken, hashedToken);
              return !isMatch;
            })
          );
          await user.save();
        }
      }

      // Clear cookie
      res.clearCookie("refreshToken");

      res.json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/auth/me
router.get("/me", protect, async (req: AuthRequest, res: Response) => {
  res.json({
    success: true,
    data: {
      user: {
        id: req.user?._id,
        email: req.user?.email,
        name: req.user?.name,
      },
    },
  });
});

export default router;
