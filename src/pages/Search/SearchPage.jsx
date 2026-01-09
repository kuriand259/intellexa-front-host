import React, { useEffect, useState, useRef } from "react";
import { Search, ListFilter, Bell, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./SearchPage.css";
import StatCard from "../../components/StatCard/StatCard";
import AddCompanyModal from "../../components/AddCompanyModal/AddCompanyModal";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

import {
  getTotalCompanies,
  searchCompanies,
  getSavedSearches,
  getRecentAlerts,
  getAllCompanies,
  filterByCountry,
  filterByRevenue
} from "../../api/search";
import { scrapeCompany } from "../../api/scraping";
import { useToast } from "../../context/ToastContext";
import { getAnalysesByScoreRange } from "../../api/analysis";

const SearchPage = () => {
  const [total, setTotal] = useState(0);
  const [activeSearches] = useState(0);
  const [savedSearchCount, setSavedSearchCount] = useState(0);
  const [alerts, setAlerts] = useState([]);

  const [query, setQuery] = useState("");
  const [tableData, setTableData] = useState([]);
  const [country, setCountry] = useState("");
  const [minRevenue, setMinRevenue] = useState(0);
  const [maxRevenue, setMaxRevenue] = useState(100000000000); // 100B to cover all companies
  const [showRevenueDropdown, setShowRevenueDropdown] = useState(false);
  const revenueDropdownRef = useRef(null);

  const [scoresMap, setScoresMap] = useState({}); // company_id -> client_score object
  const [countries, setCountries] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const { showToast, hideToast } = useToast();

  const handleScrap = async (data) => {
    // 1. Close modal immediately
    setShowModal(false);

    // 2. Show fetching toast
    showToast(`Fetching details for ${data.companyName}...`, "info");

    try {
      const response = await scrapeCompany(data);
      console.log("Scraping successful:", response.data);

      if (response.data && response.data.company_id) {
        // 3. Success Toast
        showToast("Scraping successful! Redirecting...", "success");

        // 4. Navigate after delay
        setTimeout(() => {
          navigate(`/companies/${response.data.company_id}`);
          hideToast();
        }, 1500);

      } else {
        throw new Error("No company_id in response");
      }
    } catch (error) {
      console.error("Scraping failed:", error);
      // 5. Error Toast
      showToast("Scraping failed. Please try again.", "error");

      // Auto-hide error toast after a few seconds (optional as context might handle it, but context provided doesn't have auto-hide built-in for everything, let's leave it manual or add timeout here if needed. But context impl showed a simple useState. Let's stick to simple 'showToast' calls for now. If I want auto-hide, I should have built it into context or do it here. The user requested persistent until success/fail. So I only hide on success redirect. For error, I might want to hide after delay).

      setTimeout(() => {
        hideToast();
      }, 4000);
    }
  };

  const navigate = useNavigate();

  const renderScore = (score, label) => {
    // Normalize score to 0-100 range
    const normalizedScore = Math.min(Math.max(score || 0, 0), 100);

    // Determine color based on label
    const getColor = () => {
      const labelLower = (label || 'yellow').toLowerCase();
      if (labelLower === 'green' || labelLower === 'high') return '#00e676';
      if (labelLower === 'red' || labelLower === 'low') return '#ff1744';
      return '#ffd700'; // yellow/medium
    };

    return (
      <div className="client-score-progress">
        <div className="progress-bar-container">
          <div
            className="progress-bar-fill"
            style={{
              width: `${normalizedScore}%`,
              backgroundColor: getColor()
            }}
          />
        </div>
        <span className="progress-score-text">{normalizedScore}</span>
      </div>
    );
  };

  // -------- Load Initial Data --------
  useEffect(() => {
    getTotalCompanies()
      .then(res => setTotal(res?.data?.count ?? 0))
      .catch(err => console.error("Total API failed", err));

    getSavedSearches()
      .then(res => setSavedSearchCount(res?.data?.length ?? 0))
      .catch(() => setSavedSearchCount(0));

    getRecentAlerts()
      .then(res => setAlerts(res?.data ?? []))
      .catch(() => setAlerts([]));

    searchCompanies("")
      .then(res => {
        console.log("Initial Companies", res.data);
        setTableData(
          res?.data?.data ||
          res?.data?.results ||
          res?.data ||
          []
        );
      })
      .catch(err => console.error("Initial Search failed", err));
  }, []);

  // -------- Debounced Search --------
  useEffect(() => {
    const timeout = setTimeout(async () => {
      try {
        // 0. Fetch analyses for scores (we need this for mapping)
        const anaRes = await getAnalysesByScoreRange(0, 100, 1000);
        const map = {};
        (anaRes?.data ?? []).forEach(a => {
          map[a.company_id] = a.client_score;
        });
        setScoresMap(map);

        // -----------------------
        // COMPLEX FILTERING
        // -----------------------
        let results = null;

        // 1. Base: Revenue
        if (minRevenue > 0 || maxRevenue < 100000000000) {
          const revRes = await filterByRevenue(minRevenue, maxRevenue);
          results = revRes?.data ?? [];
        }

        // 2. Intersect with Country
        if (country) {
          const countryRes = await filterByCountry(country);
          const countryData = countryRes?.data ?? [];

          if (results !== null) {
            const ids = new Set(countryData.map(c => c._id));
            results = results.filter(c => ids.has(c._id));
          } else {
            results = countryData;
          }
        }

        // 3. Intersect with Query (Search)
        if (query.trim()) {
          const searchRes = await searchCompanies(query);
          const searchData = searchRes?.data?.data || searchRes?.data?.results || searchRes?.data || [];

          if (results !== null) {
            const ids = new Set(searchData.map(c => c._id));
            results = results.filter(c => ids.has(c._id));
          } else {
            results = searchData;
          }
        }

        // 4. Fallback: If nothing was selected, fetch all
        if (results === null) {
          const res = await getAllCompanies();
          results = res?.data ?? [];
        }

        setTableData(results);

      } catch (err) {
        console.error("Search / Filter Failed", err);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [query, country, minRevenue, maxRevenue]);
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const res = await getAllCompanies();
        const companies = res?.data ?? [];

        const uniqueCountries = [
          ...new Set(
            companies
              .map(c => c?.geography?.hq?.country)
              .filter(Boolean)
          )
        ];

        setCountries(uniqueCountries.sort());
      } catch (err) {
        console.error("Failed to load countries", err);
      }
    };

    loadCountries();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Revenue Dropdown
      if (revenueDropdownRef.current && !revenueDropdownRef.current.contains(event.target)) {
        setShowRevenueDropdown(false);
      }
    };

    if (showRevenueDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showRevenueDropdown]);





  return (
    <div className="search-page">

      {/* ========= STATS ========= */}
      <div className="sp-stats-grid">
        {/* 
        <StatCard
          icon={<Search size={18} />}
          title="Total Organizations"
          value={total}
          showFooter={false}

        />

        <StatCard
          icon={<Search size={18} />}
          title="Active Searches"
          value={activeSearches}
          footer="Live"
        />

        <StatCard
          icon={<ListFilter size={18} />}
          title="Saved Searches"
          value={<span>{savedSearchCount}</span>}
          footer="Stored Queries"
        />

        <StatCard
          icon={<Bell size={18} />}
          title="Recent Alerts"
          value={
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <span>{alerts.length}</span>
              <div className="recent-alerts-list">
                {alerts.slice(0, 2).map((a, i) => (
                  <div key={i}>• {a.company_name || "Company"}</div>
                ))}
              </div>
            </div>
          }
          footer="Latest"
        /> */}

      </div>

      {/* ========= SEARCH BAR ========= */}
      <div className="sp-search-area">
        <div className="sp-search-input-wrapper">
          <input
            type="text"
            className="sp-search-input"
            placeholder="Search companies…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <select
          className="sp-filter-btn"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        >
          <option value="">All Countries</option>

          {countries.map((c, i) => (
            <option key={i} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* Revenue Dropdown */}
        <div style={{ position: "relative" }} ref={revenueDropdownRef}>
          <button
            className="sp-filter-btn"
            onClick={() => setShowRevenueDropdown(!showRevenueDropdown)}
          >
            <span>Revenue</span>
          </button>

          {showRevenueDropdown && (
            <div className="sp-revenue-dropdown">
              <div className="sp-revenue-header">
                Filter by Revenue
              </div>
              <div className="sp-revenue-slider-container">
                <Slider
                  range
                  min={0}
                  max={100000000000} // 100 Billion
                  step={100000000} // 100M increments for smoother control
                  defaultValue={[minRevenue, maxRevenue]}
                  value={[minRevenue, maxRevenue]}
                  onChange={(val) => {
                    setMinRevenue(val[0]);
                    setMaxRevenue(val[1]);
                  }}
                  trackStyle={[{ backgroundColor: "#FFD700" }]}
                  handleStyle={[
                    { borderColor: "#FFD700", backgroundColor: "#000" },
                    { borderColor: "#FFD700", backgroundColor: "#000" }
                  ]}
                  railStyle={{ backgroundColor: "#333" }}
                />
              </div>
              <div className="sp-revenue-values">
                <span>
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    notation: "compact",
                    maximumFractionDigits: 1
                  }).format(minRevenue)}
                </span>
                <span>
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    notation: "compact",
                    maximumFractionDigits: 1
                  }).format(maxRevenue)}
                </span>
              </div>
            </div>
          )}
        </div>

        <button className="sp-add-btn" onClick={() => setShowModal(true)}>
          <Plus size={18} />
          Add Company
        </button>

      </div>

      {/* ========= TABLE ========= */}
      <div className="sp-table-container">
        <table className="sp-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Revenue</th>
              <th>Operating Fields</th>
              <th>Size</th>
              <th>Client Score</th>
            </tr>
          </thead>

          <tbody>
            {tableData.map((row, index) => (
              <tr
                key={row._id || index}
                onClick={() => navigate(`/companies/${row._id}`)}
                style={{ cursor: "pointer" }}
              >
                <td>
                  <div style={{ fontWeight: "500" }}>
                    {row.company_name || "Unknown Company"}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#888" }}>
                    {row?.online_presence?.website || "—"}
                  </div>
                </td>

                <td>
                  {row?.revenue?.value
                    ? `${new Intl.NumberFormat().format(
                      row.revenue.value
                    )} ${row?.revenue?.currency || ""}`
                    : "—"}
                </td>

                <td>
                  {row?.industries?.length
                    ? row.industries.join(", ")
                    : "—"}
                </td>

                <td>
                  {row?.company_size?.employee_count
                    ? `${row.company_size.employee_count} Employees`
                    : "—"}
                </td>

                <td>
                  {renderScore(
                    scoresMap[row._id]?.value || 0,
                    (scoresMap[row._id]?.label || "yellow").toLowerCase()
                  )}
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

      <AddCompanyModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onScrap={handleScrap}
      />



    </div>
  );
};

export default SearchPage;
