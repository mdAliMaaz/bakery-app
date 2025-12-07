// Event Manager for Server-Sent Events
export type SSEEvent = {
  type:
    | "inventory-update"
    | "low-stock-alert"
    | "order-update"
    | "finished-goods-update";
  data: any;
};

class EventManager {
  private clients: Map<string, ReadableStreamDefaultController>;

  constructor() {
    this.clients = new Map();
  }

  addClient(clientId: string, controller: ReadableStreamDefaultController) {
    this.clients.set(clientId, controller);
    console.log(
      `SSE Client connected: ${clientId}. Total clients: ${this.clients.size}`
    );
  }

  removeClient(clientId: string) {
    this.clients.delete(clientId);
    console.log(
      `SSE Client disconnected: ${clientId}. Total clients: ${this.clients.size}`
    );
  }

  broadcast(event: SSEEvent) {
    const message = `data: ${JSON.stringify(event)}\n\n`;

    this.clients.forEach((controller, clientId) => {
      try {
        controller.enqueue(new TextEncoder().encode(message));
      } catch (error) {
        console.error(`Error sending to client ${clientId}:`, error);
        this.removeClient(clientId);
      }
    });
  }

  sendToClient(clientId: string, event: SSEEvent) {
    const controller = this.clients.get(clientId);
    if (controller) {
      const message = `data: ${JSON.stringify(event)}\n\n`;
      try {
        controller.enqueue(new TextEncoder().encode(message));
      } catch (error) {
        console.error(`Error sending to client ${clientId}:`, error);
        this.removeClient(clientId);
      }
    }
  }

  getClientCount(): number {
    return this.clients.size;
  }
}

// Global instance
export const eventManager = new EventManager();
