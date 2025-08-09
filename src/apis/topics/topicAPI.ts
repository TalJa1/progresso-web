import apiClient from "../apiClient";

export const getTopicById = async (topic_id: number) => {
  const response = await apiClient.get(`/topics/${topic_id}`);
  return response.data;
};

export const getAllTopics = async () => {
  const response = await apiClient.get("/topics");
  return response.data;
};
