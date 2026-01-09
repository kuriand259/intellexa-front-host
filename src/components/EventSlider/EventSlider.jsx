import React, { useEffect, useState } from "react";
import "./EventSlider.css";

const EventSlider = ({ events = [], intervalMs = 5000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!events || events.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % events.length);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [events, isPaused, intervalMs]);

  if (!events || events.length === 0) {
    return <p className="muted-text">No recent events available</p>;
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % events.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? events.length - 1 : prev - 1
    );
  };

  const currentEvent = events[currentIndex];

  return (
    <div
      className="event-slider"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slide */}
      <div key={currentEvent._id} className="event-slide">
        <div className="event-title">{currentEvent.title}</div>

        {currentEvent.description && (
          <div className="event-summary">
            {currentEvent.description}
          </div>
        )}

        <div className="event-meta">
          <span className={`event-type ${currentEvent.event_type}`}>
            {currentEvent.event_type?.replace("_", " ")}
          </span>

          <span className={`event-sentiment ${currentEvent.sentiment}`}>
            {currentEvent.sentiment}
          </span>

          <span className="event-source">
            {currentEvent.source_name}
          </span>

          <span className="event-date">
            {new Date(currentEvent.event_date).toLocaleDateString()}
          </span>
        </div>

        {currentEvent.source_url && (
          <a
            href={currentEvent.source_url}
            target="_blank"
            rel="noreferrer"
            className="event-link"
          >
            Read more →
          </a>
        )}
      </div>

      {/* Arrows */}
      {events.length > 1 && (
        <div className="event-navigation-container">
          <button className="event-nav prev" onClick={goToPrev}>
            ‹
          </button>

          {/* Dots */}
          <div className="event-dots">
            {events.map((_, index) => (
              <span
                key={index}
                className={`event-dot ${
                  index === currentIndex ? "active" : ""
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>

          <button className="event-nav next" onClick={goToNext}>
            ›
          </button>
        </div>
      )}
    </div>
  );
};

export default EventSlider;
