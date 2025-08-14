import axiosClient from "../apiClient";
import type { ExamModel } from "../../services/apiModel";

export const getAllExams = async (): Promise<ExamModel[]> => {
  const response = await axiosClient.get<ExamModel[]>(
    "/exams/?skip=0&limit=100"
  );
  return response.data;
};
