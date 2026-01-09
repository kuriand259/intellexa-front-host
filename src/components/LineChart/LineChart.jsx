import React, { useEffect, useRef, useState } from "react";

const LineChart = ({
  data = [],
  stroke = "#FAD400",
  strokeWidth = 2,
  showDots = true,
  padding = 12,
}) => {
  const containerRef = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  if (!data.length) return null;
  if (!size.width || !size.height)
   return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;

  const { width, height } = size;

  const max = Math.max(...data);
  const min = Math.min(...data);

  const points = data
    .map((value, index) => {
      const x =
        padding +
        (index / (data.length - 1)) * (width - padding * 2);

      const y =
        height -
        padding -
        ((value - min) / (max - min || 1)) *
          (height - padding * 2);

      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
      <svg width="100%" height="100%">
        <polyline
          points={points}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {showDots &&
          points.split(" ").map((point, i) => {
            const [x, y] = point.split(",");
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="3"
                fill={stroke}
              />
            );
          })}
      </svg>
    </div>
  );
};

export default LineChart;
