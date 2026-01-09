import React from "react";
import "./ClientScoreBadge.css";

const ClientScoreHero = ({ value, label }) => {
  if (value === undefined || value === null) return null;

  const normalizedLabel = label?.toLowerCase() ?? "neutral";

  return (
    <div className={`score-badge-hero ${normalizedLabel}`}>
      <div className="score-circle">
        <span className="score-value-hero">
          {value}
        </span>
      </div>
      <div className="score-label-hero">
        CLIENT SCORE
      </div>
    </div>
  );
};

export default ClientScoreHero;
