import React, { useEffect } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import "./Toast.css";

const Toast = ({ message, type = "info", isVisible, onClose }) => {
    if (!isVisible) return null;

    const Icon = () => {
        switch (type) {
            case "success": return <CheckCircle size={20} color="#4caf50" />;
            case "error": return <AlertCircle size={20} color="#ff4d4d" />;
            default: return <Info size={20} color="#FFD700" />;
        }
    };

    return (
        <div className="toast-container">
            <div className={`toast ${type}`}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Icon />
                    <span>{message}</span>
                </div>
                {onClose && (
                    <button className="toast-close-btn" onClick={onClose}>
                        <X size={18} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default Toast;
