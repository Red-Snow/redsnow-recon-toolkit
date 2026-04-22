import { GoogleGenAI } from "@google/genai";

const getClient = (userKey?: string) => {
  const key = userKey || import.meta.env.VITE_GEMINI_API_KEY || '';
  if (!key) throw new Error("API_KEY_MISSING");
  return new GoogleGenAI({ apiKey: key });
};

export const analyzeScan = async (command: string, output: string, userKey?: string) => {
  try {
    const ai = getClient(userKey);
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        You are a Senior Cybersecurity Mentor and CEH v13 Instructor. You are guiding a junior penetration tester or a student.
        
        Analyze the following Nmap scan result that your student just performed.
        
        Command Used: ${command}
        
        Scan Output:
        ${output}
        
        Provide your analysis in the following format:
        1. **Mentor's Summary**: A high-level overview of what the student found, explained simply but technically.
        2. **Critical Observations**: What are the most important things the student should notice? (Vulnerabilities, misconfigurations).
        3. **Guided Next Steps**: Instead of just listing tools, explain *why* they should take the next step. "Now that you've found port 80 open, you should..."
        4. **Pro-Tip**: A piece of industry wisdom related to this specific scan.
        5. **Encouragement**: A brief concluding sentence as a mentor.
        
        Use a professional, encouraging, and authoritative tone. Format in clean Markdown.
      `,
    });
    return response.text;
  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    if (error.message === "API_KEY_MISSING") return "API Key missing. Please configure your API key in the Settings panel.";
    return "Failed to analyze scan results. Please check your API key and network connection.";
  }
};

export const getScanningAdvice = async (query: string, userKey?: string) => {
  try {
    const ai = getClient(userKey);
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        You are a CEH v13 instructor. Answer the following question about Module 3: Scanning Networks.
        
        Question: ${query}
        
        Provide a detailed, technical, and accurate answer following the CEH v13 curriculum.
      `,
    });
    return response.text;
  } catch (error: any) {
    console.error("Gemini Advice Error:", error);
    if (error.message === "API_KEY_MISSING") return "API Key missing. Please configure your API key in the Settings panel.";
    return "I'm having trouble connecting to my knowledge base right now. Please check your API key.";
  }
};
