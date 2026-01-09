import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

// ---- Dashboard APIs ----

// Total company count
export const getCompanyCount = () =>
  api.get("/api/v1/companies/stats/count");

// New companies today
export const getNewCompaniesToday = () =>
  api.get("/api/v1/companies/recent");

// Recently updated profiles
export const getRecentlyUpdated = () =>
  api.get("/api/v1/companies");
            
// Top geographies (we'll compute from company list)
export const getCompaniesForGeo = () =>
  api.get("/api/v1/companies");

// Watchlist Activity → using events
export const getRecentEvents = () =>
  api.get("/api/v1/events");
 
// companies with the best client-fit score(max 5)
export const getTopRecommendations = () =>
  api.get("/api/v1/analysis/filter/by-label/GREEN");

export const getHighValueProspects = () =>
  api.get("/api/v1/analysis/filter/by-label/GREEN");

export const getRecentCompanies = () =>
  api.get("/api/v1/utils/companies/recent");
