import React from "react";
import "./StatCard.css";

export default function StatCard({
  icon,
  title,
  value,
  footer,
  showFooter = true,
  highlight = false,
}) {
  return (
    <div className={`stat-card ${highlight ? "highlight" : ""}`}>
      <div className="stat-header">
        <span className="stat-icon">
          {icon}
        </span>
        <span>{title}</span>
      </div>

      <div className="stat-value">{value}</div>

      {showFooter && footer && (
        <div className="stat-trend trend-up">
          {footer}
        </div>
      )}
    </div>
  );
}
