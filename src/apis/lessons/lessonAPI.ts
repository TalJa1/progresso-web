import apiClient from "../../apis/apiClient";
import type { LessonModel } from "../../services/apiModel";

export interface BulkLessonCreate {
  topic_id: number;
  title: string;
  content: string;
  video_url: string | null;
  short_describe: string;
}

export const getAllLessons = async (): Promise<LessonModel[]> => {
  const response = await apiClient.get<LessonModel[]>(`/lessons`);
  return response.data;
};

export const getLessonById = async (id: number): Promise<LessonModel> => {
  const response = await apiClient.get<LessonModel>(`/lessons/${id}`);
  return response.data;
};

export const createBulkLessons = async (
  lessons: BulkLessonCreate[]
): Promise<LessonModel[]> => {
  const response = await apiClient.post<LessonModel[]>(
    `/lessons/bulk`,
    lessons
  );
  return response.data;
};
