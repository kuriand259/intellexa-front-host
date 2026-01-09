import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL
});

// ---- SEARCH PAGE APIs ----

// Total companies
export const getTotalCompanies = () =>
    api.get("/api/v1/companies/stats/count");

// Search companies list
export const searchCompanies = (query) =>
    api.get("/api/v1/companies/search/", {
        params: {
            q: query || "",   // FastAPI uses `q`
            limit: 50
        }
    });

export const getAllCompanies = () =>
    api.get("/api/v1/companies/", {
        params: {
            limit: 50
        }
    });

// Saved searches count (if available — otherwise mock)
export const getSavedSearches = () =>
    api.get("/api/v1/companies/stats/count");

// Alerts
export const getRecentAlerts = () =>
    api.get("/api/v1/events", {
        params: { limit: 5 }
    });

// Filter by country
export const filterByCountry = (country) =>
    api.get("/api/v1/companies/filter/by-country", {
        params: {
            country,
            skip: 0,
            limit: 100
        }
    });

// Filter by revenue
export const filterByRevenue = (min, max) =>
    api.get("/api/v1/companies/filter/by-revenue", {
        params: {
            min_revenue: min,
            max_revenue: max,
            limit: 100
        }
    });
