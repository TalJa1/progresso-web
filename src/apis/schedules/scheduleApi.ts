import apiClient from "../../apis/apiClient";
import type { ScheduleCreateModel } from "../../services/apiModel";

export const getSchedulesByUser = async (user_id: number) => {
  const response = await apiClient.get(`/schedule/by-user/${user_id}`);
  return response.data;
};

export const createSchedule = async (payload: ScheduleCreateModel) => {
  const response = await apiClient.post('/schedule', payload);
  return response.data;
};
