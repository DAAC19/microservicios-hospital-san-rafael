import api from "../api/api";
import type { Report } from "../types/report";

export const getReports = async (): Promise<Report[]> => {
  const response = await api.get<Report[]>("/reports");
  return response.data;
};

export const generateReport = async (
  report: Partial<Report>
): Promise<Report> => {
  const response = await api.post<Report>("/reports", report);
  return response.data;
};

export const downloadReport = async (
  id: string | number
): Promise<Blob> => {
  const response = await api.get(`/reports/${id}/download`, {
    responseType: "blob",
  });

  return response.data;
};