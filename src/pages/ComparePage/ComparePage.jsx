import React, { useState } from 'react';
import { Plus, X, Search, ChevronRight } from 'lucide-react';
import { searchCompanies, compareCompanies } from '../../api/companies';
import './ComparePage.css';

const ComparePage = () => {
    const [selectedCompanies, setSelectedCompanies] = useState([]);
    const [comparisonData, setComparisonData] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [loadingComparison, setLoadingComparison] = useState(false);

    const handleSearch = async (term) => {
        setSearchTerm(term);
        if (term.length < 2) {
            setSearchResults([]);
            return;
        }

        setSearching(true);
        try {
            const data = await searchCompanies(term);
            setSearchResults(data);
        } catch (error) {
            console.error(error);
        } finally {
            setSearching(false);
        }
    };

    const fetchComparison = async (companies) => {
        if (companies.length < 2) {
            setComparisonData(null);
            return;
        }
        setLoadingComparison(true);
        try {
            const ids = companies.map(c => c._id);
            const data = await compareCompanies(ids);
            setComparisonData(data);
        } catch (error) {
            console.error("Failed to compare companies", error);
        } finally {
            setLoadingComparison(false);
        }
    };

    const addCompany = (company) => {
        if (selectedCompanies.find(c => c._id === company._id)) {
            alert("Company already added!");
            return;
        }

        const newSelection = [...selectedCompanies, {
            _id: company._id,
            name: company.company_name,
            logo: company.online_presence?.logo_url,
            domain: company.online_presence?.website
        }];

        setSelectedCompanies(newSelection);
        // fetchComparison(newSelection); // Removed automatic trigger

        setIsAddModalOpen(false);
        setSearchTerm('');
        setSearchResults([]);
    };

    const removeCompany = (id) => {
        const newSelection = selectedCompanies.filter(c => c._id !== id);
        setSelectedCompanies(newSelection);
        setComparisonData(null); // Reset comparison data when modifying selection
        // fetchComparison(newSelection); // Removed automatic trigger
    };

    const handleCompare = () => {
        fetchComparison(selectedCompanies);
    };

    // Placeholder for fetchFullDetails if needed, but logic is handled in fetchComparison
    const fetchFullDetails = () => { };

    const renderScore = (score) => {
        if (!score) return <span className="text-gray-500">N/A</span>;
        const color = score.overall_score >= 80 ? '#4caf50' : score.overall_score >= 50 ? '#ff9800' : '#f44336';
        return (
            <div className="cell-score">
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
                <span style={{ color: color, fontSize: '1.2rem' }}>{score.overall_score}</span>
            </div>
        );
    };

    return (
        <div className="compare-page fade-in">
            <div className="compare-header">
                <h1 className="compare-title">Compare Companies</h1>
                <p className="compare-subtitle">Select up to 2 companies to compare performance and tech stacks.</p>
            </div>
            <div className="compare-content">
                {/* Selection Area */}
                <div className="compare-selection">
                    {selectedCompanies.map(c => (
                        <div key={c._id} className="company-selector-card">
                            <button className="remove-company-btn" onClick={() => removeCompany(c._id)}>
                                <X size={20} />
                            </button>
                            {c.logo ? (
                                <div className="compare-logo-container">
                                    <img src={c.logo} alt={c.name} title={c.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '12px', background: 'white', borderRadius: '12px', boxSizing: 'border-box', border: '2px solid rgba(255, 255, 255, 0.9)' }} />
                                </div>
                            ) : (
                                <div style={{ width: '100%', height: '100%', background: '#333', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: '#666' }} title={c.name}>
                                    {c.name?.charAt(0) || '?'}
                                </div>
                            )}
                            <div className="compare-company-name" style={{textAlign: 'center', width: '100%', fontSize: '0.9rem' }}>{c.name}</div>
                        </div>
                    ))}

                    {selectedCompanies.length < 3 && ( // Limit the number of companies to be compared
                        <div className="add-company-btn" onClick={() => setIsAddModalOpen(true)}>
                            <Plus size={24} />
                        </div>
                    )}
                </div>

                {/* Compare Action */}
                {selectedCompanies.length >= 2 && !comparisonData && !loadingComparison && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                        <button className="compare-action-btn" onClick={handleCompare}>
                            Compare Companies
                        </button>
                    </div>
                )}

                {loadingComparison && (
                    <div style={{ textAlign: 'center', margin: '2rem', color: '#888' }}>
                        Loading comparison...
                    </div>
                )}
            </div>
            {/* Comparison Table */}
            {comparisonData && (
                <div className="comparison-table-container glass-panel" style={{ padding: 0 }}>
                    <table className="comparison-table">
                        <thead>
                            <tr>
                                <th>Metric</th>
                                {comparisonData.companies.map(c => (
                                    <th key={c.id} className="col-company-header">
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <span className="comparison-name">{c.name}</span>
                                            {/* <span className="comparison-domain">{c.industry}</span> */}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Industry</td>
                                {comparisonData.comparison_table.industries.map((val, i) => <td key={i}>{val}</td>)}
                            </tr>
                            <tr>
                                <td>Location</td>
                                {comparisonData.comparison_table.location.map((val, i) => <td key={i}>{val}</td>)}
                            </tr>
                            <tr>
                                <td>Employees</td>
                                {comparisonData.comparison_table.employee_count.map((val, i) => <td key={i}>{val}</td>)}
                            </tr>
                            <tr>
                                <td>Revenue</td>
                                {comparisonData.comparison_table.revenue.map((val, i) => <td key={i}>{val}</td>)}
                            </tr>
                            <tr>
                                <td>Founded</td>
                                {comparisonData.comparison_table.founded.map((val, i) => <td key={i}>{val}</td>)}
                            </tr>
                            <tr>
                                <td>Tech Stack</td>
                                {comparisonData.comparison_table.tech_stack.map((val, i) => <td key={i}>{val}</td>)}
                            </tr>
                            <tr>
                                <td>Products</td>
                                {comparisonData.comparison_table.products.map((val, i) => <td key={i}>{val}</td>)}
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}

            {/* AI Insights */}
            {comparisonData && comparisonData.ai_insights && (
                <div className="glass-panel" style={{ marginTop: '2rem', padding: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.8rem' }}>✨</span> AI Comparative Insights
                    </h2>

                    <div className="ai-insight-section">
                        <h3>Key Differences</h3>
                        <p style={{ whiteSpace: 'pre-line', lineHeight: '1.6', color: '#ddd' }}>{comparisonData.ai_insights.key_differences}</p>
                    </div>

                    <div className="ai-insight-section" style={{ marginTop: '1.5rem' }}>
                        <h3>Strengths</h3>
                        <p style={{ whiteSpace: 'pre-line', lineHeight: '1.6', color: '#ddd' }}>{comparisonData.ai_insights.strengths}</p>
                    </div>

                    {/* <div className="ai-insight-section" style={{ marginTop: '1.5rem' }}>
                        <h3>Recommendation</h3>
                        <p style={{ whiteSpace: 'pre-line', lineHeight: '1.6', color: '#ddd' }}>{comparisonData.ai_insights.recommendation}</p>
                    </div> */}
                </div>
            )}

            {!comparisonData && !loadingComparison && selectedCompanies.length > 0 && (
                <div style={{ textAlign: 'center', color: '#666', marginTop: '2rem' }}>
                    {selectedCompanies.length < 2 ? <p>Add at least one more company to compare.</p> : <p>Ready to compare.</p>}
                </div>
            )}

            {!comparisonData && !loadingComparison && selectedCompanies.length === 0 && (
                <div style={{ textAlign: 'center', color: '#666', marginTop: '4rem' }}>
                    {/* <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.2 }}>⚖️</div> */}
                    <p>Add companies to start comparing.</p>
                </div>
            )}

            {/* Add Modal */}
            {isAddModalOpen && (
                <div className="search-modal-overlay" onClick={() => setIsAddModalOpen(false)}>
                    <div className="search-modal" onClick={e => e.stopPropagation()}>
                        <div className="search-modal-header">
                            <h3>Add Company to Compare</h3>
                            <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X /></button>
                        </div>
                        <div className="search-modal-body">
                            <input
                                autoFocus
                                className="search-modal-input"
                                placeholder="Search company name..."
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>
                        <div className="search-results-list">
                            {searching && <div style={{ padding: '10px', color: '#888' }}>Searching...</div>}
                            {searchResults.map(result => (
                                <div key={result._id} className="search-result-item" onClick={() => addCompany(result)}>
                                    {result.online_presence?.logo_url ? (
                                        <img src={result.online_presence.logo_url} alt="" style={{ width: 24, height: 24, borderRadius: '4px', background: 'white', objectFit: 'contain' }} />
                                    ) : <div style={{ width: 24, height: 24, background: '#444', borderRadius: '4px' }} />}
                                    <div>
                                        <div style={{ fontWeight: 500 }}>{result.company_name || 'Unknown'}</div>
                                        {/* <div style={{ fontSize: '0.8rem', color: '#888' }}>{result.profile?.domain}</div> */}
                                    </div>
                                    <ChevronRight size={16} style={{ marginLeft: 'auto', opacity: 0.5 }} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ComparePage;
