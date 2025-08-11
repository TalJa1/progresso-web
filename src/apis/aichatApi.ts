import apiClient from "./apiClient";

export const chatWithGemini = async (message: string) => {
  const response = await apiClient.post("/api/v1/gemini-chat", { message });
  return response.data;
};
