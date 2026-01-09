import React, { useState, useEffect } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { geoCentroid } from "d3-geo";

import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";

countries.registerLocale(enLocale);

const geoUrl =
  "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson";

const MapChart = ({
  highlightedCountries = [],
  hqCountry = "",
  focusedCountry ="",
}) => {
  // ✅ DEFAULT POSITION & ZOOM
  const [position, setPosition] = useState({
    coordinates: [0, 20],
    zoom: 1.5, // 👈 default zoom level
  });

  /* ---------------- Zoom Controls ---------------- */
  const handleZoomIn = () => {
    if (position.zoom >= 4) return;
    setPosition((pos) => ({ ...pos, zoom: pos.zoom * 2 }));
  };

  const handleZoomOut = () => {
    if (position.zoom <= 1) return;
    setPosition((pos) => ({ ...pos, zoom: pos.zoom / 2 }));
  };

  const handleMoveEnd = (pos) => {
    setPosition(pos);
  };

  /* ---------------- Country → ISO ---------------- */
  const getIso = (name) => {
    if (!name) return "";

    const lower = name.toLowerCase().trim();
    const parts = lower.split(",");
    const countryPart = parts[parts.length - 1].trim();

    return (
      countries.getAlpha3Code(countryPart, "en") ||
      countries.getAlpha3Code(name, "en") ||
      ""
    );
  };

  const activeISOs = highlightedCountries.map(getIso).filter(Boolean);
  const hqISO = getIso(hqCountry);

  useEffect(() => {
  if (!focusedCountry) return;

  const iso = getIso(focusedCountry);
  if (!iso) return;

  fetch(geoUrl)
    .then((res) => res.json())
    .then((geoData) => {
      const feature = geoData.features.find(
        (f) => f.id === iso
      );

      if (!feature) return;

      const [lng, lat] = geoCentroid(feature);

      setPosition({
        coordinates: [lng, lat],
        zoom: 3, // 👈 zoom-in level when clicking
      });
    });
}, [focusedCountry]);


  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      {/* ---------------- Controls ---------------- */}
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          right: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          zIndex: 10,
        }}
      >
        <button
          onClick={handleZoomIn}
          style={controlButtonStyle}
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          style={controlButtonStyle}
        >
          −
        </button>
      </div>

      {/* ---------------- Map ---------------- */}
      <ComposableMap
        projection="geoMercator"
        style={{ width: "100%", height: "100%" }}
        projectionConfig={{
          scale: 120,
          center: [0, 20],
        }}
      >
        <ZoomableGroup
          zoom={position.zoom}
          center={position.coordinates}
          onMoveEnd={handleMoveEnd}
          minZoom={1}
          maxZoom={6}
          translateExtent={[
            [-1000, -500],
            [1000, 500],
          ]}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies
                .filter((geo) => geo.id !== "ATA") // ❌ Remove Antarctica
                .map((geo) => {
                  const iso = geo.id;
                  const isHQ = hqISO === iso;
                  const isHighlighted = activeISOs.includes(iso);

                  let fill = "#333";
                  let hoverFill = "#555";

                  if (isHQ) {
                    fill = "#3b82f6";
                    hoverFill = "#2563eb";

                  } else if (isHighlighted) {
                    fill = "var(--accent-yellow)";
                    hoverFill = "rgb(var(--rgb-yellow) / 0.5)";
                  }

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={fill}
                      stroke="#000"
                      strokeWidth={0.1}
                      style={{
                        default: { outline: "none" },
                        hover: {
                          fill: hoverFill,
                          outline: "none",
                          transition: "all 250ms",
                        },
                        pressed: { outline: "none" },
                      }}
                    />
                  );
                })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
};

/* ---------------- Styles ---------------- */
const controlButtonStyle = {
  width: "32px",
  height: "32px",
  borderRadius: "6px",
  border: "none",
  backgroundColor: "#333",
  color: "#fff",
  cursor: "pointer",
  fontSize: "18px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export default MapChart;
