import api from "./axios";

export const getCompanyAnalysis = async (companyId) => {
  const res = await api.get(`/api/v1/analysis/company/${companyId}`);
  // API returns an array → take first item
  return Array.isArray(res.data) ? res.data[0] : null;
};


export const generateCompanyAnalysis = async (companyId) => {
  const res = await api.post(`/api/v1/analysis/generate/${companyId}`);
  return res.data;
};

export const getCompaniesByLabel = (label) => {
  return api.get(`/api/v1/analysis/filter/by-label/${label}`);
};

export const getAnalysesByScoreRange = (min = 0, max = 100, limit = 1000) => {
  return api.get("/api/v1/analysis/filter/by-score", {
    params: { min_score: min, max_score: max, limit }
  });
};

