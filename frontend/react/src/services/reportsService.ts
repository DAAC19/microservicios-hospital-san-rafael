import api from "../api/api";

/**
 * Obtiene el reporte del servidor.
 * @param query  Puede ser solo el tipo ("general") o un query string completo
 *               con filtros ("type=alerts&severity=CRITICAL&date_from=2025-01-01").
 *               El componente Reports.tsx ya construye el query string completo.
 */
export const getReports = async (query: string = "general"): Promise<unknown> => {
  // Si el string no contiene "=" es solo el tipo (llamada legacy)
  const qs = query.includes("=") ? query : `type=${query}`;
  const response = await api.get(`/reports?${qs}`);
  return response.data;
};

/**
 * Descarga el reporte como PDF (si el backend lo soporta) o como JSON fallback.
 */
export const downloadReport = async (type: string = "general"): Promise<void> => {
  const response = await api.get(`/reports/download?type=${type}`, {
    responseType: "blob",
  });

  // Detecta si la respuesta es PDF o JSON por el Content-Type
  const contentType = (response.headers["content-type"] as string | undefined) ?? "application/json";
  const isPdf = contentType.includes("pdf");

  const blob = new Blob([response.data], { type: contentType });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `reporte_${type}.${isPdf ? "pdf" : "json"}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};