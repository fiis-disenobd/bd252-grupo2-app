import { GoogleGenAI, Type } from "@google/genai";

const SYSTEM_INSTRUCTION = `
You are an Elasticsearch Query DSL expert. 
Your task is to convert a natural language request describing sales data into a valid Elasticsearch JSON query object.
The index has the following mapping:
- cod_venta (integer)
- fecha_hora_venta (date, ISO format)
- monto_venta (float)

Return ONLY the JSON object for the "query" part of the Elasticsearch request. 
Do not include "sort" or "size", only the "query" object (e.g. { "bool": ... } or { "match_all": ... } or { "range": ... }).
Today's date is ${new Date().toISOString().split('T')[0]}.
`;

export const generateEsQueryFromText = async (prompt: string): Promise<any> => {
  if (!process.env.API_KEY) {
    throw new Error("Gemini API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        // Using a loose object schema to allow flexibility in ES DSL structure
        responseSchema: {
            type: Type.OBJECT,
            properties: {}, 
        } 
      },
    });

    const text = response.text;
    if (!text) return null;
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini conversion error:", error);
    throw new Error("Failed to interpret search query.");
  }
};
