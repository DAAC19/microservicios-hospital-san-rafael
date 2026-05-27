import type { AxiosError } from "axios";
import api from "../api/api";

export type ReportType = "general" | "alerts" | "metrics" | "devices" | "last_24h";

export type ReportPayload = Record<string, unknown>;

const GATEWAY_BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "http://localhost:5000";

const normalizeReportType = (type: string) =>
  type === "last_24h" ? "last24h" : type;

const getReportTypeFromQuery = (query: ReportType | string) => {
  if (!query.includes("=")) {
    return query;
  }

  const params = new URLSearchParams(query);
  return (params.get("type") || "general") as string;
};

const getReportQueryString = (query: ReportType | string) => {
  if (!query.includes("=")) {
    return "";
  }

  const params = new URLSearchParams(query);
  params.delete("type");
  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
};

const buildReportUrl = (query: ReportType | string) => {
  const reportType = normalizeReportType(getReportTypeFromQuery(query));
  const queryString = getReportQueryString(query);

  return `${GATEWAY_BASE_URL}/api/reports/${reportType}${queryString}`;
};

const getFriendlyErrorMessage = (error: unknown) => {
  const axiosError = error as AxiosError | undefined;

  if (axiosError?.isAxiosError) {
    const status = axiosError.response?.status;
    if (status === 401) {
      return "Unauthorized. Please log in again.";
    }
    if (status === 403) {
      return "You do not have permission to access this report.";
    }
    if (status === 404) {
      return "The requested report was not found. Please verify the report type.";
    }
    if (status === 500) {
      return "The reports server encountered an error. Please try again later.";
    }
    if (!axiosError.response) {
      return "Could not connect to the reports server. Please check your network connection.";
    }
    return axiosError.response.statusText || "An error occurred in the reports gateway.";
  }

  if (error instanceof Error) {
    const lower = error.message.toLowerCase();
    if (lower.includes("timeout")) {
      return "The request took too long. Please try again later.";
    }
    if (lower.includes("network")) {
      return "Could not connect to the reports server. Please check your network connection.";
    }
    return error.message;
  }

  return "An unexpected error occurred while fetching the report.";
};

/**
 * Obtiene el reporte del servidor.
 * @param query Puede ser solo el tipo ("general") o un query string completo
 *              con filtros ("type=alerts&severity=CRITICAL&date_from=2025-01-01").
 */
export const getReports = async (
  query: ReportType | string = "general"
): Promise<ReportPayload> => {
  const url = buildReportUrl(query);

  try {
    const response = await api.get<ReportPayload>(url);
    const data = response.data;

    const isEmptyObject =
      data && typeof data === "object" && !Array.isArray(data) && Object.keys(data).length === 0;
    const isEmptyArray = Array.isArray(data) && data.length === 0;

    if (data == null || isEmptyObject || isEmptyArray) {
      throw new Error("No data found for the requested report.");
    }

    return data;
  } catch (error) {
    const message = getFriendlyErrorMessage(error);
    throw new Error(`Failed to load the report. ${message}`, { cause: error });
  }
};

/**
 * Descarga el reporte como PDF si el backend lo soporta,
 * o como JSON si el backend responde ese formato.
 */
export const downloadReport = async (
  type: ReportType | string = "general"
): Promise<void> => {
  const url = buildReportUrl(type);
  const reportType = normalizeReportType(getReportTypeFromQuery(type));

  try {
    const response = await api.get<Blob>(url, {
      responseType: "blob",
    });

    const contentType =
      (response.headers["content-type"] as string | undefined) ?? "application/json";
    const isPdf = contentType.includes("pdf");
    const extension = isPdf ? "pdf" : "json";
    const filename = `reporte_${reportType}.${extension}`;

    const blob = new Blob([response.data], { type: contentType });

    if (!blob.size) {
      throw new Error("The downloaded report is empty.");
    }

    const urlObject = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = urlObject;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(urlObject);
  } catch (error) {
    const message = getFriendlyErrorMessage(error);
    throw new Error(`Failed to download the report. ${message}`, { cause: error });
  }
};
