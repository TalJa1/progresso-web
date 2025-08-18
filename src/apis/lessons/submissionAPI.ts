import apiClient from "../../apis/apiClient";
import type {
  SubmissionModel,
  SubmissionModelCreate,
} from "../../services/apiModel";

export const getSubmissionsByUserId = async (
  userId: number
): Promise<SubmissionModel[]> => {
  const response = await apiClient.get<SubmissionModel[]>(
    `/submissions/user/${userId}`
  );
  return response.data;
};

export const createSubmission = async (
  payload: SubmissionModelCreate
): Promise<SubmissionModel> => {
  const response = await apiClient.post<SubmissionModel>(
    "/submissions",
    payload
  );
  return response.data;
};
