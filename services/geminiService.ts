import { GoogleGenAI } from "@google/genai";
import { GeminiAction } from '../types';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const MODEL_NAME = 'gemini-2.5-flash';

export const generateStoryContent = async (
  currentContent: string, 
  action: GeminiAction, 
  instruction?: string
): Promise<string> => {
  if (!apiKey) {
    console.error("API Key not found");
    return "API Key missing. Cannot generate content.";
  }

  let prompt = "";
  let systemInstruction = "You are a master storyteller specializing in dark, atmospheric, and weird fiction. You write with elegant prose.";

  switch (action) {
    case GeminiAction.CONTINUE:
      prompt = `Continue the following story. Maintain the tone and style. Do not repeat the last sentence, just pick up where it left off.\n\nStory so far:\n${currentContent}`;
      break;
    case GeminiAction.IMPROVE:
      prompt = `Rewrite the following text to be more evocative, sensory, and atmospheric. Keep the original meaning but enhance the prose.\n\nText:\n${currentContent}`;
      break;
    case GeminiAction.IDEAS:
      prompt = `Give me 3 unique, dark, and twisty plot ideas based on this premise:\n${currentContent}`;
      systemInstruction = "You are a creative writing coach specializing in dark fiction.";
      break;
  }

  if (instruction) {
    prompt += `\n\nAdditional Instruction: ${instruction}`;
  }

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.8,
        topK: 40,
        maxOutputTokens: 1000,
      }
    });
    
    return response.text || "";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate content.");
  }
};

export const generateStoryTitle = async (content: string): Promise<string> => {
   if (!apiKey) return "Untitled";
   
   try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Generate a short, mysterious, and catchy title for this story. Return ONLY the title, no quotes.\n\nStory excerpt:\n${content.substring(0, 500)}`,
    });
    return response.text?.trim() || "Untitled";
   } catch (e) {
     return "Untitled";
   }
};

export const generateStorySpeech = async (text: string, voiceName: string = 'Fenrir'): Promise<Uint8Array> => {
  if (!apiKey) throw new Error("API Key missing");

  // Truncate text if excessively long to ensure the demo responds reasonably fast.
  const safeText = text.length > 5000 ? text.substring(0, 5000) + "..." : text;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: {
        parts: [{ text: safeText }]
      },
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName }
          }
        }
      }
    });

    const base64Data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Data) throw new Error("No audio generated");

    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  } catch (error) {
    console.error("Gemini TTS Error:", error);
    throw error;
  }
};