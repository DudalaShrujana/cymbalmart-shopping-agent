import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini SDK with User-Agent header for telemetry
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", aiConfigured: !!ai });
  });

  // Generate Party Shopping Plan via Gemini
  app.post("/api/plan-event", async (req, res) => {
    try {
      const {
        partyType,
        theme,
        budget,
        guestCount,
        adultCount,
        kidCount,
        dietaryNeeds,
        vibe,
        specialRequests,
        durationHours,
      } = req.body;

      if (!ai) {
        // Fallback flag if API key is missing
        return res.status(200).json({
          fallback: true,
          message: "Using CymbalMart smart offline catalog generation.",
        });
      }

      const prompt = `You are the CymbalMart AI Party Planning Shopping Concierge.
Create a comprehensive, curated, budget-conscious grocery and party supplies shopping list from CymbalMart.

Event Specifications:
- Event Type: ${partyType || "Celebration"}
- Theme: ${theme || "General Party"}
- Total Budget: $${budget || 150}
- Total Guests: ${guestCount || 10} (${adultCount || 8} adults, ${kidCount || 2} children)
- Duration: ${durationHours || 3} hours
- Dietary Constraints: ${Array.isArray(dietaryNeeds) && dietaryNeeds.length ? dietaryNeeds.join(", ") : "Standard"}
- Vibe / Food Style: ${vibe || "Casual Buffet / Finger Foods"}
- Special Requests & Notes: ${specialRequests || "None"}

Rules:
1. Provide a well-balanced shopping list divided into 4 categories:
   - "food_drinks": Mains, sides, snacks, desserts, non-alcoholic drinks, alcohol (if adults present and not kid-only), ice.
   - "tableware": Plates, napkins, cups, cutlery, serving platters, tablecloths.
   - "decor": Theme-aligned balloons, banners, centerpieces, lighting.
   - "entertainment_favors": Games, party favor bags, activity craft kits, glow items.
2. The TOTAL estimated cost of all items must be closely aligned with the budget ($${budget}). Stay within $${Math.max(10, (budget || 150) * 0.95)} and $${budget || 150}.
3. Provide realistic portion math (e.g. "Serves 12 - approx 2 servings per adult", "10 lbs ice for 15 guests").
4. Include helpful host tips (timeline recommendations and portion advice).
5. For each item, provide a realistic retail price in USD, quantity, package unit, portion note, and a dietary tag if relevant.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          systemInstruction:
            "You are an expert event planning and retail shopping specialist for CymbalMart. Return valid JSON only adhering strictly to the schema.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              themeSummary: { type: Type.STRING },
              estimatedTotal: { type: Type.NUMBER },
              hostTips: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              timelineAdvice: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    timeframe: { type: Type.STRING },
                    action: { type: Type.STRING },
                  },
                  required: ["timeframe", "action"],
                },
              },
              items: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    category: {
                      type: Type.STRING,
                      description:
                        "One of: food_drinks, tableware, decor, entertainment_favors",
                    },
                    unitPrice: { type: Type.NUMBER },
                    quantity: { type: Type.INTEGER },
                    packageUnit: { type: Type.STRING },
                    portionMath: { type: Type.STRING },
                    brandTier: {
                      type: Type.STRING,
                      description: "CymbalMart Value, Cymbal Select, or Artisan Brand",
                    },
                    dietaryTag: { type: Type.STRING },
                    notes: { type: Type.STRING },
                  },
                  required: [
                    "name",
                    "category",
                    "unitPrice",
                    "quantity",
                    "packageUnit",
                    "portionMath",
                  ],
                },
              },
            },
            required: [
              "title",
              "themeSummary",
              "estimatedTotal",
              "hostTips",
              "timelineAdvice",
              "items",
            ],
          },
        },
      });

      const parsedData = JSON.parse(response.text || "{}");
      res.json({ success: true, plan: parsedData });
    } catch (err: any) {
      console.error("Error in /api/plan-event:", err);
      res.status(500).json({ error: err.message || "Failed to generate plan" });
    }
  });

  // Interactive AI Assistant Chat
  app.post("/api/chat-agent", async (req, res) => {
    try {
      const { messages, currentPlan, eventDetails } = req.body;

      if (!ai) {
        return res.status(200).json({
          reply:
            "I'm here to help refine your CymbalMart party plan! You can adjust guest numbers, budget, swap items, or ask for party game ideas.",
        });
      }

      const planSummary = currentPlan
        ? `Current Plan: ${currentPlan.title} ($${currentPlan.estimatedTotal?.toFixed(2)} total, ${currentPlan.items?.length || 0} items for ${eventDetails?.guestCount || 10} guests, budget: $${eventDetails?.budget || 150}).
Items: ${(currentPlan.items || [])
            .slice(0, 15)
            .map((i: any) => `${i.name} (qty: ${i.quantity}, $${(i.unitPrice * i.quantity).toFixed(2)})`)
            .join("; ")}`
        : "No plan loaded yet.";

      const formattedMessages = (messages || []).map((m: any) => `${m.role === "user" ? "Customer" : "CymbalMart Assistant"}: ${m.content}`).join("\n");

      const prompt = `You are the CymbalMart Assistant, an intelligent and courteous retail shopping chatbot for CymbalMart customers planning events. You are helpful, friendly, enthusiastic, practical, and focused on helping customers plan smooth events and stay on budget.
${planSummary}

Conversation history:
${formattedMessages}

Provide a concise, helpful, and polite response (1-3 paragraphs max). If the customer asks to add items, modify quantities, update the shopping list, adjust dietary preferences, calculate portions (e.g. ice, drinks, pizza slices), suggest party games, or save money, provide specific, clear recommendations and mention that they can click the quick add buttons or adjust quantities directly in their shopping checklist to automatically recalculate the budget totals.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          systemInstruction:
            "You are the CymbalMart Assistant. Help customers with concise, practical shopping list management, portion advice, and budget balancing.",
        },
      });

      res.json({ reply: response.text });
    } catch (err: any) {
      console.error("Error in /api/chat-agent:", err);
      res.status(500).json({ error: err.message || "Failed to process chat" });
    }
  });

  // Optimize / Balance Budget endpoint
  app.post("/api/optimize-budget", async (req, res) => {
    try {
      const { currentItems, targetBudget, mode } = req.body; // mode: "reduce_cost" | "upgrade_premium" | "exact_match"

      if (!ai) {
        return res.json({ success: false, message: "AI not available" });
      }

      const prompt = `Analyze this CymbalMart shopping list and adjust items so the total equals approximately $${targetBudget}.
Mode requested: ${mode || "reduce_cost"}.

Current Items:
${JSON.stringify(currentItems)}

Instructions:
1. Adjust quantities or suggest lower/higher tier items to reach within 5% of target budget $${targetBudget}.
2. Retain essential tableware and food portions.
3. Return the updated array of items in JSON.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              strategyUsed: { type: Type.STRING },
              savingsOrDelta: { type: Type.NUMBER },
              adjustedItems: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    category: { type: Type.STRING },
                    unitPrice: { type: Type.NUMBER },
                    quantity: { type: Type.INTEGER },
                    packageUnit: { type: Type.STRING },
                    portionMath: { type: Type.STRING },
                    brandTier: { type: Type.STRING },
                    dietaryTag: { type: Type.STRING },
                    notes: { type: Type.STRING },
                  },
                  required: ["name", "category", "unitPrice", "quantity", "packageUnit", "portionMath"],
                },
              },
            },
            required: ["strategyUsed", "savingsOrDelta", "adjustedItems"],
          },
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json({ success: true, data: parsed });
    } catch (err: any) {
      console.error("Error in /api/optimize-budget:", err);
      res.status(500).json({ error: err.message || "Failed to optimize budget" });
    }
  });

  // Vite middleware in dev / static in prod
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
    console.log(`CymbalMart Party Planner server running on http://localhost:${PORT}`);
  });
}

startServer();
