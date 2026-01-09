import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getCompanyById } from "../../api/companies";
import { getCompanyAnalysis, generateCompanyAnalysis } from "../../api/analysis";
import { getCompanyEvents } from "../../api/events";
import { Mail, Phone, Globe, Linkedin, MapPin, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";



import MapChart from "../../components/MapChart/MapChart";
import ClientScoreHero from "../../components/ClientScoreBadge/ClientScoreBadge";
import EventSlider from "../../components/EventSlider/EventSlider";

import "./CompanyProfile.css";
import { Marker } from "react-simple-maps";

const CompanyProfile = () => {
  const { companyId } = useParams();

  const [company, setCompany] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [focusedCountry, setFocusedCountry] = useState("");

  const navigate = useNavigate();



  const handleGenerateAnalysis = async () => {
    try {
      setIsGenerating(true);
      const newAnalysis = await generateCompanyAnalysis(companyId);
      setAnalysis(newAnalysis);
    } catch (err) {
      console.error("Failed to generate analysis:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const logoUrl = company?.online_presence?.logo_url ?? null;

  useEffect(() => {
    if (!companyId) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const [companyRes, analysisRes, eventsRes] = await Promise.all([
          getCompanyById(companyId),
          getCompanyAnalysis(companyId),
          getCompanyEvents(companyId),
        ]);

        setCompany(companyRes);
        setAnalysis(analysisRes);
        setEvents(eventsRes);
        console.log("Company Data:", companyRes);
      } catch (err) {
        setError("Failed to load company data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [companyId]);

  if (loading) return <div>Loading company...</div>;
  if (error) return <div>{error}</div>;

  /* ------------------ Company data ------------------ */
  const companyName = company?.company_name ?? "—";
  const description = company?.description ?? "";
  const headquarters = company?.geography?.hq?.country ?? "";
  const operatingCountries =
    company?.geography?.operating_countries ?? [];

  /* ------------------ Analysis data ------------------ */
  const recommendationText =
    analysis?.client_score?.recommendation ?? "";
  const recommendationSummary =
    analysis?.reasoning?.summary ?? "";

  return (
    <div className="company-profile-page">

      {/* =============== Top Action Buttons ============= */}
      <div className="top-action-buttons">

        {/* Back Button */}
        <button
          className="back-btn company-profile-card"
          onClick={() => navigate("/search")}
        >
          <ArrowLeft size={20} />
          {/* <span>Back to Search</span> */}
        </button>

        <div className="analysis-scraping-buttons">
          <button
            className="generate-analysis-btn"
            onClick={handleGenerateAnalysis}
            disabled={isGenerating}
          >
            {isGenerating ? "Generating..." : "Generate Analysis"}
          </button>
        </div>
      </div>

      {/* ================= First Row ================= */}
      <div className="first-row">
        <div className="company-overview-card company-profile-card highlighted-card">

          <div className="company-logo-container">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={`${companyName} logo`}
                className="company-logo-image"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="company-logo-fallback">
                {companyName.charAt(0)}
              </div>
            )}
          </div>

          <div className="company-details-container">
            <span className="company-name">{companyName}</span>

            {headquarters && (
              <div className="company-headquarters">
                <MapPin size={14} className="hq-icon" />
                <span>{headquarters}</span>
              </div>
            )}


            {description && (
              <p className="company-description">
                {description}
              </p>
            )}
          </div>

          <div className="score-container">
            <ClientScoreHero
              value={analysis?.client_score?.value}
              label={analysis?.client_score?.label}
            />
          </div>

        </div>
      </div>


      <div className="company-profile-card">

        {/* ================= Analysis & Events Row ================= */}
        <div className="analysis-events-row">

          {/* <div className="recommendation-events-container"> */}
          {/* <div className="recommendation-card company-profile-card">
              <h3 style={{ margin: "0" }}>Recommendation</h3>
              <p style={{ margin: "0" }}>{recommendationText}</p>
            </div> */}

          {/* ================= Analysis Summary ================= */}
          <div className="summary-card ">
            <div className="summary-header">
              <h3>Analysis Summary</h3>
            </div>
            <p style={{ whiteSpace: "pre-line" }}>
              {recommendationSummary}
            </p>
          </div>

          <div className="vertical-border-line"/>

          {/* ================= News & Events ================= */}
          <div className="events-card ">
            <h3>News & Events</h3>
            {/* <div className="events-slider-container"> */}
              <EventSlider events={events} />
            {/* </div> */}
          </div>

        </div>

        {/* ================= Tech Stack & Product Row ================= */}
        <div className="tech-product-row">

          {/* ================= Tech Stack ================= */}
          <div className="tech-stack-card">
            <h3>Tech Stack</h3>

            {company?.tech_stack?.length > 0 ? (
              <div className="tech-tags">
                {company.tech_stack.map((tech) => (
                  <span key={tech} className="tech-tag">
                    {tech}
                  </span>
                ))}
              </div>
            ) : (
              <p className="muted-text">No tech stack data available</p>
            )}
          </div>

          <div className="vertical-border-line"/>


          {/* ================= Products ================= */}
          <div className=" products-card">
            <h3>Products</h3>

            {company?.offerings?.products?.length > 0 ? (
              <div className="social-links">
                {company.offerings.products.map((product) => {
                  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(product + " " + companyName)}`;

                  return (
                    <a
                      key={product}
                      href={searchUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="social-icon"
                    >
                      {/* <span className="product-dot">■</span> */}
                      {product}
                    </a>
                  );
                })}
              </div>
            ) : (
              <p className="muted-text">No product data available</p>
            )}
          </div>
        </div>
      </div>

      {/* ================= Map Row ================= */}
        <div className="map-row">
          <div className="map-sidebar">
            <h3>Geo Presence</h3>
            <div className="geo-content">
              {headquarters && (
                <div className="geo-section">
                  <span className="geo-label">Headquarters</span>
                  <span className="geo-value">{headquarters}</span>
                </div>
              )}

              {operatingCountries.length > 0 && (
                <div className="geo-section">
                  <span className="geo-label">Operating Countries</span>
                  <div className="geo-tags">
                    {operatingCountries.map((country) => (
                      <span
                        key={country}
                        className="geo-tag"
                        onClick={() => setFocusedCountry(country)}
                        style={{ cursor: "pointer" }}
                      >
                        {country}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="map-container">
            <MapChart
              hqCountry={headquarters}
              highlightedCountries={operatingCountries}
              focusedCountry={focusedCountry}
            />
          </div>

          {/* ================= Contact Information ================= */}
          <div className="company-profile-card contact-card">
            <h3>Contact Info</h3>

            <div className="contact-content">
              {/* Emails */}
              {company?.contacts?.emails?.length > 0 && (
                <div className="contact-section">
                  <span className="contact-label">Emails</span>
                  {company.contacts.emails.map((email) => (
                    <div key={email} className="contact-item">
                      <Mail size={14} />
                      <a href={`mailto:${email}`}>{email}</a>
                    </div>
                  ))}
                </div>
              )}

              {/* Phones */}
              {company?.contacts?.phones?.length > 0 && (
                <div className="contact-section">
                  <span className="contact-label">Phones</span>
                  {company.contacts.phones.map((phone) => (
                    <div key={phone} className="contact-item">
                      <Phone size={14} />
                      <span>{phone}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Online Presence */}
              {(company?.online_presence?.website ||
                company?.online_presence?.linkedin_url) && (
                  <div className="contact-section">
                    <span className="contact-label">Online Presence</span>
                    <div className="social-links">
                      {company?.online_presence?.website && (
                        <a
                          href={company.online_presence.website}
                          target="_blank"
                          rel="noreferrer"
                          className="social-icon"
                        >
                          <Globe size={16} />
                          Website
                        </a>
                      )}

                      {company?.online_presence?.linkedin_url && (
                        <a
                          href={company.online_presence.linkedin_url}
                          target="_blank"
                          rel="noreferrer"
                          className="social-icon"
                        >
                          <Linkedin size={16} />
                          LinkedIn
                        </a>
                      )}
                    </div>
                  </div>
                )}
            </div>
          </div>

        </div>

    </div>
  );
};

export default CompanyProfile;
