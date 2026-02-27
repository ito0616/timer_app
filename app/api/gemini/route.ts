import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY || "";

export async function POST(req: NextRequest) {
    if (!API_KEY) {
        return NextResponse.json(
            { error: "GEMINI_API_KEY が設定されていません。" },
            { status: 500 }
        );
    }

    try {
        const { prompt } = await req.json();

        if (!prompt || typeof prompt !== "string") {
            return NextResponse.json(
                { error: "prompt が必要です。" },
                { status: 400 }
            );
        }

        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        return NextResponse.json({ text });
    } catch (e: any) {
        // エラー詳細をサーバーログとレスポンスに含める
        const message = e?.message ?? String(e);
        const status = e?.status ?? e?.statusCode ?? 500;
        console.error("Gemini API error detail:", message);
        return NextResponse.json(
            { error: message },
            { status: typeof status === "number" ? status : 500 }
        );
    }
}
