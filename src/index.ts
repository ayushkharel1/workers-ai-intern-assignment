import { MEMORY } from "./memory";

export default {
  async fetch(request: Request, env: any) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204 });
    }

    const url = new URL(request.url);

    // Chat endpoint
    if (url.pathname === "/api/chat" && request.method === "POST") {
      const { session, message } = await request.json();

      // Get durable object instance for session
      const id = env.MEMORY.idFromName(session);
      const obj = env.MEMORY.get(id);

      // Add user message to memory
      const history = await obj.fetch("https://memory/add", {
        method: "POST",
        body: JSON.stringify({ role: "user", content: message })
      }).then(r => r.json());

      // Call Workers AI
      const aiResponse = await env.AI.run(
        "@cf/meta/llama-3.3-8b-instruct",
        { messages: history }
      );

      // Save assistant response
      await obj.fetch("https://memory/add", {
        method: "POST",
        body: JSON.stringify({ role: "assistant", content: aiResponse.response })
      });

      return new Response(
        JSON.stringify({ reply: aiResponse.response }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // Static frontend
    if (url.pathname === "/") {
      return env.ASSETS.fetch(request);
    }

    return new Response("Not Found", { status: 404 });
  }
};
