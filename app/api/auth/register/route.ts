import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb/connection";
import { User, UserRole } from "@/lib/mongodb/models";
import { generateTokenPair } from "@/lib/auth/jwt";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { name, email, password, role } = body;

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Create new user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || UserRole.STAFF,
    });

    // Generate tokens
    const tokens = generateTokenPair(user);

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        ...tokens,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to register user", details: error.message },
      { status: 500 }
    );
  }
}
