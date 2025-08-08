import apiClient from '../../apis/apiClient';
import type { LessonModel } from '../../services/apiModel';

export const getAllLessons = async (skip = 0, limit = 3): Promise<LessonModel[]> => {
  const response = await apiClient.get<LessonModel[]>(`/lessons?skip=${skip}&limit=${limit}`);
  return response.data;
};
