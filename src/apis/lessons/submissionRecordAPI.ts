import apiClient from "../../apis/apiClient";
import type {
  SubmissionRecordModelCreate,
  SubmissionRecordModel,
} from "../../services/apiModel";

export async function createSubmissionRecord(
  record: SubmissionRecordModelCreate
): Promise<void> {
  await apiClient.post(`/submission_record`, record);
}

export async function createSubmissionRecordBatch(
  records: SubmissionRecordModelCreate[]
): Promise<void> {
  await apiClient.post(`/submission_record/batch`, records);
}

export async function getSubmissionRecordsBySubmissionAndUser(
  submissionId: number,
  userId: number
): Promise<SubmissionRecordModel[]> {
  const resp = await apiClient.get<SubmissionRecordModel[]>(
    `/submission_record/by_submission/${submissionId}/user/${userId}`
  );
  return resp.data;
}
