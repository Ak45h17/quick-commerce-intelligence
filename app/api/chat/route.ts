import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(request: Request) {
  try {
    const body = await request.json() as { messages: ChatMessage[]; context: string };
    const model = genAI.getGenerativeModel({
     model: "gemini-2.0-flash",
      systemInstruction: "You are a quick commerce expert helping a D2C brand manager take action on market signals. Be direct, specific, and concise. Give numbered action steps when asked."
    });

    const history = body.messages.slice(0, -1).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    }));

    const lastMessage = body.messages[body.messages.length - 1];
    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: `Context:\n${body.context}` }] },
        { role: "model", parts: [{ text: "Understood. I have the context and I'm ready to help." }] },
        ...history
      ]
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          const result = await chat.sendMessageStream(lastMessage.content);
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) controller.enqueue(encoder.encode(text));
          }
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();
        }
      }
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache"
      }
    });
  } catch (error) {
    console.error(error);
    return new Response("Unable to stream AI response.", { status: 500 });
  }
}