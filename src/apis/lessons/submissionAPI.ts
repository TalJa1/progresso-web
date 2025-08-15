import apiClient from "../../apis/apiClient";
import type { SubmissionModel } from "../../services/apiModel";

export const getSubmissionsByUserId = async (
  userId: number
): Promise<SubmissionModel[]> => {
  const response = await apiClient.get<SubmissionModel[]>(
    `/submissions/user/${userId}`
  );
  return response.data;
};
