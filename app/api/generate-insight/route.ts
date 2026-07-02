import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash"  });
    const result = await model.generateContent({
      systemInstruction: "You are an AI analyst for a quick commerce intelligence platform used by D2C brands in India. Given a market signal, generate a 2-3 sentence insight in plain English. Be specific: mention estimated revenue impact, competitor names, and a concrete recommended action. Do not use bullet points. Do not use markdown.",
      contents: [{ role: "user", parts: [{ text: JSON.stringify(body) }] }]
    });
    const insight = result.response.text().trim();
    return NextResponse.json({ insight });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to generate insight." }, { status: 500 });
  }
}