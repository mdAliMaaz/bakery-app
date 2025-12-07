import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken, JWTPayload } from "./jwt";
import { UserRole } from "@/lib/mongodb/models";

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

export const authenticate = (
  handler: (req: AuthenticatedRequest, context?: any) => Promise<NextResponse>
) => {
  return async (
    req: AuthenticatedRequest,
    context?: any
  ): Promise<NextResponse> => {
    try {
      const authHeader = req.headers.get("authorization");

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }

      const token = authHeader.substring(7);
      const payload = verifyAccessToken(token);

      if (!payload) {
        return NextResponse.json(
          { error: "Invalid or expired token" },
          { status: 401 }
        );
      }

      req.user = payload;
      return handler(req, context);
    } catch (error) {
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      );
    }
  };
};

export const authorize = (allowedRoles: UserRole[]) => {
  return (
    handler: (req: AuthenticatedRequest, context?: any) => Promise<NextResponse>
  ) => {
    return authenticate(
      async (
        req: AuthenticatedRequest,
        context?: any
      ): Promise<NextResponse> => {
        if (!req.user) {
          return NextResponse.json(
            { error: "Authentication required" },
            { status: 401 }
          );
        }

        if (!allowedRoles.includes(req.user.role)) {
          return NextResponse.json(
            { error: "Insufficient permissions" },
            { status: 403 }
          );
        }

        return handler(req, context);
      }
    );
  };
};

export const extractUser = (req: NextRequest): JWTPayload | null => {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.substring(7);
    return verifyAccessToken(token);
  } catch (error) {
    return null;
  }
};
