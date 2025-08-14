import axiosClient from "../apiClient";
import type { QuestionModel } from "../../services/apiModel";

// Get questions with answers by exam id
export const getQuestionsWithAnswersByExamId = async (examId: number): Promise<QuestionModel[]> => {
	const response = await axiosClient.get(`/questions-with-answers/exam/${examId}`);
	return response.data;
};
