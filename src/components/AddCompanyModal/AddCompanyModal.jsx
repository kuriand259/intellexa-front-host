import React, { useState } from "react";
import { X, Loader } from "lucide-react";
import "./AddCompanyModal.css";

const AddCompanyModal = ({ isOpen, onClose, onScrap }) => {
    const [formData, setFormData] = useState({
        companyName: "",
        website: "",
        industry: "",
        country: "",
    });
    const [error, setError] = useState("");

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (name === "companyName" && error) setError("");
    };

    const handleSubmit = () => {
        if (!formData.companyName.trim()) {
            setError("Company Name is required");
            return;
        }
        onScrap(formData);
        handleClose();
    };

    const handleClose = () => {
        setFormData({
            companyName: "",
            website: "",
            industry: "",
            country: "",
        });
        setError("");
        onClose();
    };

    return (
        <div className="acm-overlay" onClick={handleClose}>
            <div className="acm-content" onClick={(e) => e.stopPropagation()}>
                <button className="acm-close-btn" onClick={handleClose}>
                    <X size={24} />
                </button>

                <div className="acm-title">Add New Company</div>

                {/* Company Name (Mandatory) */}
                <div className="acm-field-group">
                    <label className="acm-label">Company Name *</label>
                    <input
                        type="text"
                        name="companyName"
                        className={`acm-input ${error ? "error" : ""}`}
                        placeholder="e.g. Intel"
                        value={formData.companyName}
                        onChange={handleChange}
                        autoFocus
                    />
                    {error && <div className="acm-error-msg">{error}</div>}
                </div>

                {/* Website (Optional) */}
                <div className="acm-field-group">
                    <label className="acm-label">Website (Optional)</label>
                    <input
                        type="text"
                        name="website"
                        className="acm-input"
                        placeholder="e.g. intel.com"
                        value={formData.website}
                        onChange={handleChange}
                    />
                </div>

                {/* Industry (Optional) */}
                <div className="acm-field-group">
                    <label className="acm-label">Industry (Optional)</label>
                    <input
                        type="text"
                        name="industry"
                        className="acm-input"
                        placeholder="e.g. Semiconductor"
                        value={formData.industry}
                        onChange={handleChange}
                    />
                </div>

                {/* Country (Optional) */}
                <div className="acm-field-group">
                    <label className="acm-label">Country (Optional)</label>
                    <input
                        type="text"
                        name="country"
                        className="acm-input"
                        placeholder="e.g. USA"
                        value={formData.country}
                        onChange={handleChange}
                    />
                </div>

                <button className="acm-action-btn" onClick={handleSubmit}>
                    Scrap Details
                </button>
            </div>
        </div>
    );
};

export default AddCompanyModal;
