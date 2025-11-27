import { NextRequest } from "next/server";
import { eventManager } from "@/lib/sse/eventManager";
import { verifyAccessToken } from "@/lib/auth/jwt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Verify authentication
  const authHeader = req.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response("Unauthorized", { status: 401 });
  }

  const token = authHeader.substring(7);
  const payload = verifyAccessToken(token);

  if (!payload) {
    return new Response("Invalid or expired token", { status: 401 });
  }

  // Generate unique client ID
  const clientId = `${payload.userId}-${Date.now()}`;

  // Create SSE stream
  const stream = new ReadableStream({
    start(controller) {
      // Add client to event manager
      eventManager.addClient(clientId, controller);

      // Send initial connection message
      const welcomeMessage = `data: ${JSON.stringify({
        type: "connection",
        message: "Connected to SSE",
        clientId,
      })}\n\n`;
      controller.enqueue(new TextEncoder().encode(welcomeMessage));

      // Keep-alive ping every 30 seconds
      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(": keep-alive\n\n"));
        } catch (error: unknown) {
          console.error("Error sending keep-alive ping:", error);
          clearInterval(keepAlive);
        }
      }, 30000);

      // Cleanup on close
      req.signal.addEventListener("abort", () => {
        clearInterval(keepAlive);
        eventManager.removeClient(clientId);
        try {
          controller.close();
        } catch (error) {
          // Controller already closed
        }
      });
    },
    cancel() {
      eventManager.removeClient(clientId);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
