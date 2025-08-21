import apiClient from "../../apis/apiClient";
import type { SubmissionRecordModel } from "../../services/apiModel";

export async function createSubmissionRecord(
  record: SubmissionRecordModel
): Promise<void> {
  await apiClient.post(`/submission_record`, record);
}

export async function createSubmissionRecordBatch(
  records: SubmissionRecordModel[]
): Promise<void> {
  await apiClient.post(`/submission_record/batch`, records);
}
