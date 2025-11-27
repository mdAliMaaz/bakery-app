import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb/connection";
import { User } from "@/lib/mongodb/models";
import { verifyRefreshToken, generateAccessToken } from "@/lib/auth/jwt";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json(
        { error: "Refresh token is required" },
        { status: 400 }
      );
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);

    if (!payload) {
      return NextResponse.json(
        { error: "Invalid or expired refresh token" },
        { status: 401 }
      );
    }

    // Verify user still exists
    const user = await User.findById(payload.userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate new access token
    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({
      accessToken,
    });
  } catch (error: any) {
    console.error("Token refresh error:", error);
    return NextResponse.json(
      { error: "Failed to refresh token", details: error.message },
      { status: 500 }
    );
  }
}
