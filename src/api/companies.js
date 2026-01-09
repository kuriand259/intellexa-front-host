import api from "./axios";

export const getCompanyById = async (companyId) => {
  const response = await api.get(`/api/v1/companies/${companyId}`);
  return response.data;
};

export const searchCompanies = async (query) => {
  const response = await api.get(`/api/v1/companies/search/?q=${query}&limit=10`);
  return response.data;
};

export const compareCompanies = async (companyIds) => {
  const response = await api.post("/api/v1/companies/compare", {
    company_ids: companyIds,
  });
  return response.data;
};
