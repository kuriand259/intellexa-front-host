import api from "./axios";

/**
 * Get events for a specific company
 * Used in: CompanyProfile
 */
export const getCompanyEvents = async (companyId) => {
  if (!companyId) return [];

  const res = await api.get(`/api/v1/events/company/${companyId}`);
  return Array.isArray(res.data) ? res.data : [];
};

/**
 * Get events across all companies
 * Used in: Dashboard (news feed, alerts, trends)
 */
export const getAllCompanyEvents = async (params = {}) => {
  const res = await api.get("/api/v1/events", {
    params, // optional filters (limit, type, date range, etc.)
  });

  return Array.isArray(res.data) ? res.data : [];
};
