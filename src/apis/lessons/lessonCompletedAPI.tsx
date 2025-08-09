import type { LessonCompletionCreateModel } from "../../services/apiModel";
import apiClient from "../apiClient";

export const getLessonsCompletedByUser = async (user_id: number) => {
  const response = await apiClient.get(`/lessons-completed/by-user/${user_id}`);
  return response.data;
};

export const createLessonCompleted = async (
  data: LessonCompletionCreateModel
) => {
  const response = await apiClient.post("/lessons-completed", data);
  return response.data;
};
