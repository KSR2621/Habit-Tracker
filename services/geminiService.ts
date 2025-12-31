
import { GoogleGenAI } from "@google/genai";
import { Habit } from "../types.ts";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getHabitInsights = async (habits: Habit[]) => {
  const habitsSummary = habits.map(h => `${h.name}: ${h.completed ? 'Achieved' : 'In Progress'} (${h.streak} day streak)`).join(', ');
  
  const prompt = `Act as a Strategic Life Architect. Analyze these habits: ${habitsSummary}. Provide one elite strategic insight for the user to optimize their 2026 performance. Use business and high-performance terminology. Max 25 words.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Operational efficiency is optimal. Prioritize high-impact annual milestones to maintain Q1 momentum.";
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return "Consistency is the foundation of high-performance architecture. Continue tracking daily rituals.";
  }
};
