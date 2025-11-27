import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb/connection";
import { User } from "@/lib/mongodb/models";
import { authenticate, AuthenticatedRequest } from "@/lib/auth/middleware";

async function handler(req: AuthenticatedRequest) {
  try {
    await connectDB();

    const user = await User.findById(req.user!.userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: "Failed to get user info", details: error.message },
      { status: 500 }
    );
  }
}

export const GET = authenticate(handler);
