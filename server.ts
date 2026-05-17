import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Fallback static questions for when API quota is exceeded
const FALLBACK_QUESTIONS = [
  {
    question: "How do you prefer to spend your free time?",
    options: [
      { text: "Coding or playing with new gadgets", category: "tech" },
      { text: "Sketching, writing, or playing music", category: "creative" },
      { text: "Organizing events or leading a group", category: "management" },
      { text: "Volunteering or helping friends with problems", category: "social" }
    ]
  },
  {
    question: "Which work environment sounds most appealing?",
    options: [
      { text: "A high-tech lab or software firm", category: "tech" },
      { text: "A studio or advertising agency", category: "creative" },
      { text: "A corporate office or startup hub", category: "management" },
      { text: "A hospital, school, or non-profit", category: "social" }
    ]
  },
  {
    question: "What kind of problems do you enjoy solving?",
    options: [
      { text: "Logical or mathematical puzzles", category: "tech" },
      { text: "Visual or conceptual design challenges", category: "creative" },
      { text: "Structural or organizational inefficiencies", category: "management" },
      { text: "Interpersonal conflicts or social issues", category: "social" }
    ]
  },
  {
    question: "Which tool would you rather master?",
    options: [
      { text: "A complex programming language", category: "tech" },
      { text: "A professional design software", category: "creative" },
      { text: "A project management dashboard", category: "management" },
      { text: "Effective communication and empathy", category: "social" }
    ]
  },
  {
    question: "When working on a project, what's your focus?",
    options: [
      { text: "Optimizing the code and performance", category: "tech" },
      { text: "Refining the aesthetic and user feel", category: "creative" },
      { text: "Ensuring deadlines and budgets are met", category: "management" },
      { text: "Ensuring the team is happy and supported", category: "social" }
    ]
  }
];

// API Routes
app.post("/api/quiz/generate", async (req, res) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: "Generate 10 diversified career interest questions to help identify a person's core strengths and professional interests. Each question should have 4 options reflecting different career paths (e.g., Tech, Creative, Management, Social/Health). Return in JSON format.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    text: { type: Type.STRING },
                    category: { type: Type.STRING }
                  },
                  required: ["text", "category"]
                }
              }
            },
            required: ["question", "options"]
          }
        }
      }
    });

    res.json(JSON.parse(response.text || '[]'));
  } catch (error: any) {
    console.error("Gemini Error:", error);
    // Resource exhaustion (quota) check
    if (error.message?.includes("RESOURCE_EXHAUSTED") || error.message?.includes("quota") || error.status === 429) {
      console.log("Quota exceeded, providing fallback questions.");
      return res.json(FALLBACK_QUESTIONS);
    }
    res.status(500).json({ error: "Failed to generate quiz" });
  }
});

app.post("/api/quiz/analyze", async (req, res) => {
  const { answers } = req.body;
  try {
    const prompt = `Based on these career interest quiz responses: ${JSON.stringify(answers)}, identify the top 3 fields this person is most suited for. For each field, provide:
1. Field name
2. Why it matches their interests
3. Future career prospects
4. Why those prospects are good
5. Current employment demand
Return in JSON format.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              field: { type: Type.STRING },
              matchReason: { type: Type.STRING },
              prospects: { type: Type.STRING },
              prospectsReason: { type: Type.STRING },
              employmentDemand: { type: Type.STRING }
            },
            required: ["field", "matchReason", "prospects", "prospectsReason"]
          }
        }
      }
    });

    res.json(JSON.parse(response.text || '[]'));
  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    
    // Simple fallback analysis based on most frequent category
    if (error.message?.includes("RESOURCE_EXHAUSTED") || error.message?.includes("quota") || error.status === 429) {
      console.log("Quota exceeded, providing fallback analysis.");
      const counts: Record<string, number> = {};
      (answers || []).forEach((a: any) => {
        counts[a.category] = (counts[a.category] || 0) + 1;
      });
      
      const topCategory = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'tech';
      
      const fallbacks: Record<string, any[]> = {
        tech: [{
          field: "Software Engineering & Data Analysis",
          matchReason: "Your responses suggest a high affinity for systems, logic, and technical tools.",
          prospects: "High",
          prospectsReason: "The world is becoming increasingly software-driven.",
          employmentDemand: "Very High"
        }],
        creative: [{
          field: "Creative Strategy & Digital Design",
          matchReason: "Your interests lean heavily towards aesthetic expression and conceptual thinking.",
          prospects: "Growing",
          prospectsReason: "High-quality design is a key differentiator in crowded markets.",
          employmentDemand: "High"
        }],
        management: [{
          field: "Operational Leadership & Strategic Management",
          matchReason: "You prioritize efficiency, organization, and leading teams to success.",
          prospects: "Crucial",
          prospectsReason: "Complex projects always need skilled leaders to execute them.",
          employmentDemand: "High"
        }],
        social: [{
          field: "Community Relations & Social Service",
          matchReason: "You have a strong focus on human impact, empathy, and social growth.",
          prospects: "Stable",
          prospectsReason: "Human interaction skills are increasingly valued as machines take over routine tasks.",
          employmentDemand: "Stable"
        }]
      };

      return res.json(fallbacks[topCategory] || fallbacks.tech);
    }
    
    res.status(500).json({ error: "Failed to analyze results" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
