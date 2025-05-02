// src/app/api/chat/route.ts (or wherever you placed it)

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, Content } from '@google/generative-ai';

const MODEL_NAME = "gemini-1.5-flash-latest";
const API_KEY = process.env.GEMINI_API_KEY || "";

interface ChatRequestBody {
    history: Content[]; // Array of message objects { role: 'user' | 'model', parts: [{ text: string }] }
    message: string;    // The new user message
}

export async function POST(request: NextRequest) {
    console.log("--- API Route Start ---");

    if (!API_KEY) {
        console.error("API Route Error: GEMINI_API_KEY not found.");
        return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }
    console.log("API Key: Loaded");

    try {
        console.log("Attempting to parse request body...");
        const reqBody: ChatRequestBody = await request.json();
        console.log("Request Body Parsed.");

        // Rename for clarity
        const historyFromFrontend = reqBody.history;
        const newMessageText = reqBody.message;

        if (!newMessageText) {
            console.error("API Route Error: Message is required.");
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }
        console.log("Received Message:", newMessageText);
        console.log("Received History Length:", historyFromFrontend?.length ?? 0);

        // ---> FIX: Validate history for startChat <---
        let historyForStartChat = historyFromFrontend;
        // Check if history exists, has items, and the FIRST item's role is not 'user'.
        // This specifically handles the case where the frontend sends the initial bot greeting.
        if (historyForStartChat && historyForStartChat.length > 0 && historyForStartChat[0].role !== 'user') {
             console.warn(`History received from frontend started with role '${historyForStartChat[0].role}'. Resetting history to empty for startChat.`);
             // Reset to empty array, as startChat requires history (if provided) to start with 'user'.
             // An empty history is valid for starting a new chat.
             historyForStartChat = [];
        }
        // ---> END FIX <---

        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });
        console.log("Google AI SDK Initialized with model:", MODEL_NAME);

        const generationConfig = {
            temperature: 0.9,
            topK: 1,
            topP: 1,
            maxOutputTokens: 2048,
        };

        const safetySettings = [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        ];

        console.log("Starting chat session with validated history length:", historyForStartChat.length);
        const chat = model.startChat({
            generationConfig,
            safetySettings,
            history: historyForStartChat, // USE THE VALIDATED/potentially empty HISTORY HERE
        });
        console.log("Chat session started. Sending message to Gemini...");

        // Send the user's *new* message using sendMessage
        const result = await chat.sendMessage(newMessageText);
        console.log("Received raw result from Gemini."); // Simplified log

        const response = result.response;
        if (!response) {
             console.error("API Route Error: No response object found in Gemini result.");
             throw new Error("Received no response object from Gemini.");
        }
        console.log("Gemini Response object obtained.");

        const text = response.text();
         if (typeof text !== 'string' || text.trim() === '') {
             console.error("API Route Error: response.text() did not return a valid string. Got:", text);
              // Handle potentially empty responses gracefully if needed by your use case
             // For now, treat as an error or return a default message
              // throw new Error("Empty text response received from Gemini.");
             console.warn("Empty text response received from Gemini. Returning default message.");
             return NextResponse.json({ response: "..." }); // Or handle as needed
         }
        console.log("Extracted text from Gemini:", text.substring(0, 100) + "..."); // Log snippet

        console.log("--- API Route Success ---");
        return NextResponse.json({ response: text });

    } catch (error: any) {
        console.error("--- API Route Error Caught ---");
        console.error("Detailed Error:", error); // Log the full error object
        console.error("Error Message:", error.message);

        let clientErrorMessage = 'Failed to fetch response from AI';
        if (error?.message?.includes('API key not valid')) {
            clientErrorMessage = 'Invalid API Key configured on the server.';
        } else if (error?.message?.includes('RESOURCE_EXHAUSTED') || error?.message?.includes('rate limit')) {
             clientErrorMessage = 'AI Rate limit exceeded. Please try again later.';
        } else if (error?.message?.includes('candidates list is empty')) {
             clientErrorMessage = 'AI response was blocked or empty. Try rephrasing your message.';
        } // Add more specific checks if needed

        return NextResponse.json({ error: clientErrorMessage }, { status: 500 });
    }
}