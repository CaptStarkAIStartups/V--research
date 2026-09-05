import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const message = String(body?.message || "").trim();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        text:
          "AI Lab is connected to V Research, but an AI provider key has not been configured yet. Add OPENAI_API_KEY in your deployment environment to activate the AI assistant.",
        configured: false,
      });
    }

    /*
      AI provider integration is intentionally kept server-side.

      The API key must NEVER be placed in page.tsx,
      globals.css, or any client-side JavaScript.
    */

    return NextResponse.json({
      text:
        "Your AI provider is configured. The secure AI model connection can now be enabled from the server.",
      configured: true,
    });
  } catch {
    return NextResponse.json(
      {
        error: "Unable to process the AI request.",
      },
      { status: 500 }
    );
  }
}
