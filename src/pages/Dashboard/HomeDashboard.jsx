import React, { useEffect, useState } from 'react';
import { Building2, PlusCircle, Flame, RefreshCw, MoreHorizontal, ChevronRight } from 'lucide-react';

import EventSlider from "../../components/EventSlider/EventSlider";

import MapChart from '../../components/MapChart/MapChart';
import StatCard from "../../components/StatCard/StatCard";

import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from "recharts";
import { getCompanyCount, getNewCompaniesToday, getRecentlyUpdated, getCompaniesForGeo, getRecentEvents, getTopRecommendations, getHighValueProspects, getRecentCompanies } from "../../api/dashboard";
import { getCompaniesByLabel } from "../../api/analysis";
import { getCompanyById } from "../../api/companies";
import './HomeDashboard.css';

// main yellow accent is already in CSS, keeping ui same
const CACHE_KEY_EVENTS = 'dashboard_recent_events';

const HomeDashboard = () => {

    // Removed blocking loading state to allow progressive rendering
    // const [loading, setLoading] = useState(true);

    // Dashboard state
    const [totalCompanies, setTotalCompanies] = useState(0);
    const [newToday, setNewToday] = useState(0);
    const [recentUpdated, setRecentUpdated] = useState(0);
    const [geoTop, setGeoTop] = useState([]);
    const [events, setEvents] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [highValueCount, setHighValueCount] = useState(0);
    const [trendBars, setTrendBars] = useState([]);
    const [loading, setLoading] = useState(false);

    const [scoreData, setScoreData] = useState([]);
    const [companyNames, setCompanyNames] = useState({});


    useEffect(() => {
        const fetchScoreData = async () => {
            setLoading(true);
            try {
                // Fetch counts for each label in parallel
                const [greenRes, yellowRes, redRes] = await Promise.all([
                    getCompaniesByLabel("GREEN"),
                    getCompaniesByLabel("YELLOW"),
                    getCompaniesByLabel("RED")
                ]);

                console.log("Score Responses:", "Green:", greenRes, "Yellow:", yellowRes, "Red:", redRes);
                const greenCount = greenRes.data?.length || 0;
                const yellowCount = yellowRes.data?.length || 0;
                const redCount = redRes.data?.length || 0;

                setScoreData([
                    { name: "High Score", value: greenCount },
                    { name: "Medium Score", value: yellowCount },
                    { name: "Low Score", value: redCount }
                ]);
                console.log("Score Data:", scoreData);
            } catch (error) {
                console.error("Failed to fetch score data", error);
                setScoreData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchScoreData();

        // 1. Independent light calls: Fire and forget (update state when done)
        getCompanyCount()
            .then(res => setTotalCompanies(res.data?.count ?? 0))
            .catch(err => console.error("Count API failed", err));

        getNewCompaniesToday()
            .then(res => setNewToday(res.data?.length ?? 0))
            .catch(err => console.error("NewToday API failed", err));

        // 0. Try loading from cache first
        const cachedEvents = localStorage.getItem(CACHE_KEY_EVENTS);
        if (cachedEvents) {
            try {
                setEvents(JSON.parse(cachedEvents));
            } catch (e) {
                console.error("Failed to parse cached events", e);
            }
        }

        getRecentEvents()
            .then(res => {
                const data = res.data || [];
                setEvents(data);
                // Update cache
                localStorage.setItem(CACHE_KEY_EVENTS, JSON.stringify(data));
            })
            .catch(err => {
                console.error("Events API failed", err);
                // If API fails, we already have cached data in state if available.
            });

        getTopRecommendations()
            .then(async res => {
                const recs = res.data || [];
                // Filter out duplicates by company_id
                const uniqueRecs = Object.values(
                    recs.reduce((acc, curr) => {
                        if (curr.company_id && !acc[curr.company_id]) {
                            acc[curr.company_id] = curr;
                        }
                        return acc;
                    }, {})
                );

                setRecommendations(uniqueRecs);

                // Fetch names for these companies explicitly
                const newNames = {};
                await Promise.all(uniqueRecs.map(async (r) => {
                    if (r.company_id) {
                        try {
                            const companyData = await getCompanyById(r.company_id);
                            if (companyData && companyData.company_name) {
                                newNames[r.company_id] = companyData.company_name;
                                console.log(`Fetched name for ${r.company_id}: ${companyData.company_name}`);
                            }
                        } catch (e) {
                            console.error(`Failed to fetch name for ${r.company_id}`, e);
                        }
                    }
                }));

                setCompanyNames(prev => ({ ...prev, ...newNames }));
            })
            .catch(err => console.error("Recos API failed", err));

        getHighValueProspects()
            .then(res => setHighValueCount(res?.data?.length ?? 0))
            .catch(err => console.error("HighVal API failed", err));

        getRecentCompanies()
            .then(res => {
                // Build Last 30 Days Trend
                const companies = res?.data || [];
                const map = {};
                companies.forEach(c => {
                    const d = new Date(c.created_at).toISOString().slice(0, 10);
                    map[d] = (map[d] || 0) + 1;
                });

                const last30 = [];
                for (let i = 29; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    const key = d.toISOString().slice(0, 10);
                    last30.push(map[key] || 0);
                }
                setTrendBars(last30);
            })
            .catch(err => console.error("RecentCompanies API failed", err));


        // 2. Heavy Data call (Consolidated)
        // getRecentlyUpdated() & getCompaniesForGeo() both fetched /api/v1/companies
        // We call it once here.
        getRecentlyUpdated()
            .then(res => {
                const companies = res.data || [];

                // A. Recently Updated Count
                setRecentUpdated(companies.length);

                // B. Top Geography Calculation
                const countryMap = {};
                const namesMap = {};

                companies.forEach(c => {
                    const country = c?.geography?.hq?.country || "Unknown";
                    countryMap[country] = (countryMap[country] || 0) + 1;
                    // console.log("Processing company for geo:", countryMap, c, 'Country: ${country}');

                    // Map ID to Name
                    if (c._id && c.company_name) {
                        namesMap[c._id] = c.company_name;
                        // console.log(`Mapping company ID to name: ${c._id} -> ${c.company_name}`);
                        // console.log("Raw company object:", c);

                    }
                });

                // setCompanyNames(namesMap);
                // console.log("Company Names Map:", namesMap ,companyNames);

                const sorted = Object.entries(countryMap)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([country, count]) => ({ country, count }));

                setGeoTop(sorted);
                console.log("Top Geographies:", sorted);
            })
            .catch(err => console.error("Heavy Companies API failed", err));

    }, []);

    // Removed blocking loading check
    // if (loading) return <div style={{ padding: 20 }}>Loading Dashboard…</div>;


    return (
        <div className="home-dashboard">

            {/* ================= TOP STATS ================= */}
            <div className="stats-grid">

                <StatCard
                    icon={<PlusCircle size={18} />}
                    title="New Companies Added"
                    value={
                        <>
                            +{newToday} <span style={{ fontSize: "1rem", color: "#888" }}>Today</span>
                        </>
                    }
                    footer=""
                />

                <StatCard
                    icon={<Building2 size={18} />}
                    title="Total Companies"
                    value={totalCompanies}
                    footer=""
                />

                <StatCard
                    icon={<Flame size={18} />}
                    title="High-Value Prospects"
                    value={highValueCount}
                    footer="AI Fit: GREEN Prospects"
                />

                <StatCard
                    icon={<RefreshCw size={18} />}
                    title="Recently Updated Profiles"
                    value={recentUpdated}
                    footer=""
                />
            </div>



            {/* ================= MIDDLE SECTION ================= */}
            <div className="mid-section">

                {/* ---- Watchlist Activity (Expanded) ---- */}
                <div className="company-profile-card">
                    <h3>News & Events</h3>
                    <EventSlider events={events} />
                </div>




                {/* ---- AI Recommendations UI ---- */}
                <div className="dashboard-card company-profile-card" style={{ padding: '1rem' }}>
                    <div className="card-header" style={{ marginBottom: '1rem' }}>
                        <span style={{ color: '#cbb26a' }}>AI Recommendations</span>
                        {/* <MoreHorizontal size={16} /> */}
                    </div>
                    <ul>
                        {recommendations.map((r, i) => (
                            <li key={r._id || i}>
                                {companyNames[r.company_id] || r.company_id || "Company"}
                                {' '}— <b>{r?.client_score?.value}</b> ({r?.client_score?.label})
                            </li>
                        ))}
                    </ul>
                </div>
                {/* --- Top Recommended Companies --- */}
                {/* <div className="ai-card">
                        <div style={{
                            fontWeight: '600',
                            marginBottom: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}>
                            <div style={{
                                width: 20,
                                height: 20,
                                borderRadius: '50%',
                                background: '#3b82f6',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '10px'
                            }}>
                                T
                            </div>
                            Top 5 Companies to Target
                        </div>

                        {recommendations.length === 0 && (
                            <div className="ai-skeleton">
                                <div></div><div></div><div></div>
                            </div>
                        )}


                        <ul style={{
                            fontSize: '0.8rem',
                            paddingLeft: '20px',
                            color: '#aaa',
                            lineHeight: '1.4'
                        }}>
                            {recommendations.map((r, i) => (
                                <li key={r._id || i}>
                                    {r?.company_id || "Company"}
                                    {' '}— <b>{r?.client_score?.value}</b> ({r?.client_score?.label})
                                </li>
                            ))}
                        </ul>
                    </div> */}

                {/* --- Gold Section --- */}
                {/* <div className="ai-card gold-type">
                        <div style={{
                            fontWeight: '600',
                            marginBottom: '4px',
                            display: 'flex',
                            justifyContent: 'space-between'
                        }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{
                                    width: 20,
                                    height: 20,
                                    borderRadius: '50%',
                                    background: '#ffd700',
                                    color: 'black',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '10px'
                                }}>
                                    N
                                </div>
                                New Companies
                            </span>
                            <ChevronRight size={16} />
                        </div>

                        <div style={{ fontSize: '0.8rem', color: '#aaa' }}>
                            Based on best-fit AI analysis
                        </div>
                    </div>
                </div>  */}
                {/* Score Distribution (Donut Chart) */}
                <div className="dashboard-card" style={{ minHeight: "300px" }}>
                    <div className="card-header">
                        <span>Score Distribution</span>
                        <span style={{ fontSize: "0.8rem", color: "#888" }}>
                            Client Quality Distribution
                        </span>
                    </div>

                    <div
                        style={{
                            width: "100%",
                            height: "240px",
                            position: "relative"
                        }}
                    >
                        <ResponsiveContainer width="100%" height={240}>
                            <PieChart>
                                <Pie
                                    data={scoreData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={65}
                                    outerRadius={85}
                                    paddingAngle={4}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {scoreData.map((entry, index) => {
                                        let color = "#888";
                                        if (entry.name.includes("High")) color = "#10b981";
                                        else if (entry.name.includes("Medium")) color = "#FFD700";
                                        else if (entry.name.includes("Low")) color = "#ef4444";

                                        return <Cell key={`cell-${index}`} fill={color} />;
                                    })}
                                </Pie>

                                <RechartsTooltip
                                    contentStyle={{
                                        backgroundColor: "#18181b",
                                        border: "1px solid #333",
                                        borderRadius: "8px"
                                    }}
                                    itemStyle={{ color: "white" }}
                                />

                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    iconType="circle"
                                    wrapperStyle={{ fontSize: "12px" }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>



            </div>


            {/* ================= BOTTOM SECTION ================= */}
            <div className="bottom-section highlight">

                {/* ---- Map Section ---- */}
                <div className="dashboard-card">
                    <div className="card-header">
                        <span>Top Geographies (Map)</span>
                    </div>

                    <div className="map-placeholder">
                        <MapChart
                            // hqCountry="United States"
                            highlightedCountries={
                                geoTop.map(g => g.country)
                            }
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', fontSize: '0.9rem' }}>
                        {geoTop.slice(0, 5).map((g, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                {g.country}
                            </div>
                        ))}
                    </div>
                </div>


                {/* ---- Dynamic Top Geographies ---- */}
                <div className="dashboard-card highlight">
                    <div className="card-header">
                        <span>Top Geographies</span>
                    </div>

                    <div className="geo-list">
                        {geoTop.map((g, i) => (
                            <div className="geo-item" key={i}>
                                <span style={{ display: 'flex', gap: '8px' }}>
                                    {g.country}
                                </span>
                                <span>{g.count}</span>
                            </div>
                        ))}
                    </div>

                    <div style={{ textAlign: 'right', marginTop: '1rem', color: '#888', fontSize: '0.8rem', cursor: 'pointer' }}>
                        View All &gt;
                    </div>
                </div>



            </div>

        </div>
    );
};

export default HomeDashboard;
