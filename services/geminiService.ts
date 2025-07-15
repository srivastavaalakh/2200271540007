
import { GoogleGenAI } from "@google/genai";
import type { ClickData } from "../types";

// This check is to prevent crashing in environments where process.env is not defined.
const apiKey = typeof process !== 'undefined' && process.env && process.env.API_KEY
  ? process.env.API_KEY
  : "";

if (!apiKey) {
  console.warn("API_KEY environment variable not found. Gemini features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey });

export const analyzeTraffic = async (clicks: ClickData[]): Promise<string> => {
  if (!apiKey) {
    return "API Key is not configured. Traffic analysis is unavailable.";
  }

  if (clicks.length === 0) {
    return "No click data available to analyze.";
  }

  const simplifiedClicks = clicks.map(c => ({
    time: new Date(c.timestamp).toUTCString(),
    source: c.source,
    location: c.location
  })).slice(0, 50); // Limit data points to keep prompt concise

  const prompt = `
    As a data analyst, provide a brief, user-friendly summary of the following URL click traffic.
    Highlight key trends, such as peak activity times, most common traffic sources, and popular geographical regions.
    The tone should be insightful but easy to understand for a non-technical user.

    Here is the click data (up to 50 recent clicks):
    ${JSON.stringify(simplifiedClicks, null, 2)}

    Please provide your analysis as a single paragraph.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.5,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error analyzing traffic with Gemini:", error);
    return "An error occurred while analyzing the traffic data. Please try again later.";
  }
};
