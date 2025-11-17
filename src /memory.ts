export class MEMORY {
  state: any;
  data: any[];

  constructor(state: any) {
    this.state = state;
    this.data = [];
  }

  async fetch(request: Request) {
    const url = new URL(request.url);

    // Add a message
    if (url.pathname === "/add") {
      const msg = await request.json();
      this.data.push(msg);

      // Keep last 6 messages only
      if (this.data.length > 6) {
        this.data.shift();
      }

      await this.state.storage.put("history", this.data);
      return new Response(JSON.stringify(this.data));
    }

    // Get all history
    if (url.pathname === "/history") {
      const saved = await this.state.storage.get("history") || [];
      return new Response(JSON.stringify(saved));
    }

    return new Response("Not found", { status: 404 });
  }
}
