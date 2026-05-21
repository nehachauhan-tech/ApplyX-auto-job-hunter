import { GoogleGenAI } from "@google/genai";
import aiModels from "@/config/ai-models.json";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not set. AI features will not work.");
}

export const genAI = apiKey ? new GoogleGenAI({ apiKey }) : null;

export type ModelCategory = keyof typeof aiModels.models;
export type RecommendedUseCase = keyof typeof aiModels.recommendedModels;

export function getModelId(useCase: RecommendedUseCase): string {
  return aiModels.recommendedModels[useCase];
}

export function getModelInfo(modelId: string) {
  for (const category of Object.values(aiModels.models)) {
    for (const [, model] of Object.entries(category)) {
      if ((model as { modelId: string }).modelId === modelId) {
        return model;
      }
    }
  }
  return null;
}

export function getAllModels() {
  const models: Array<{
    category: string;
    key: string;
    modelId: string;
    name: string;
    status: string;
    description: string;
    bestUseCase: string;
  }> = [];

  for (const [category, categoryModels] of Object.entries(aiModels.models)) {
    for (const [key, model] of Object.entries(categoryModels)) {
      const m = model as {
        modelId: string;
        name: string;
        status: string;
        description: string;
        bestUseCase: string;
      };
      models.push({
        category,
        key,
        modelId: m.modelId,
        name: m.name,
        status: m.status,
        description: m.description,
        bestUseCase: m.bestUseCase,
      });
    }
  }

  return models;
}

export function getStableModels() {
  return getAllModels().filter((m) => m.status === "stable");
}

export function getPreviewModels() {
  return getAllModels().filter((m) => m.status === "preview");
}

export async function generateContent(
  prompt: string,
  modelId: string = aiModels.recommendedModels.default
) {
  if (!genAI) {
    throw new Error("Gemini API key not configured");
  }

  const response = await genAI.models.generateContent({
    model: modelId,
    contents: prompt,
  });

  return response.text;
}

export async function generateWithModel(
  prompt: string,
  useCase: RecommendedUseCase
) {
  const modelId = getModelId(useCase);
  return generateContent(prompt, modelId);
}

export { aiModels };
