import apiClient from "../../apis/apiClient";
import type { LessonModel } from "../../services/apiModel";

export const getAllLessons = async (): Promise<LessonModel[]> => {
  const response = await apiClient.get<LessonModel[]>(`/lessons`);
  return response.data;
};

export const getLessonById = async (id: number): Promise<LessonModel> => {
  const response = await apiClient.get<LessonModel>(`/lessons/${id}`);
  return response.data;
};
