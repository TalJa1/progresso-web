import axiosClient from "../apiClient";
import type { QuizletModel } from "../../services/apiModel";

export const getQuizletByLessonId = async (
  lessonId: number
): Promise<QuizletModel[]> => {
  const response = await axiosClient.get(`/quizlet/by-lesson/${lessonId}`);
  return response.data;
};
