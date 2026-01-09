import apiClient from "./axios";

export const scrapeCompany = (data) => {
    return apiClient.post("/api/v1/scraping/gather", {
        company_name: data.companyName,
        website: data.website,
        industry: data.industry,
        country: data.country,
        force_rescrape: false,
    });
};
