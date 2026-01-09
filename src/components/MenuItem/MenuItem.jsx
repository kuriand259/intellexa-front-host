import React, { useRef } from "react";
import "./MenuItem.css";

export default function MenuItem({
  icon,
  iconSrc,
  activeIconSrc,
  useMask = true,
  active = false,
  onClick,
  ariaLabel = "menu item",
  className = "",
  ...props
}) {
  const ref = useRef(null);

  const handleMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ref.current.style.setProperty("--x", `${x}px`);
    ref.current.style.setProperty("--y", `${y}px`);
  };

  const showIconSrc = active && activeIconSrc ? activeIconSrc : iconSrc;

  return (
    <button
      ref={ref}
      className={`menu-item ${active ? "menu-item-active" : ""} ${className}`}
      onMouseMove={handleMouseMove}
      onClick={onClick}
      aria-label={ariaLabel}
      {...props}
    >
      {/* Glow layer */}
      <span className="menu-item-glow" />

      {/* Icon rendering */}
      {useMask && showIconSrc && (
        <span
          className="menu-item-icon menu-item-icon-mask"
          style={{
            WebkitMaskImage: `url(${showIconSrc})`,
            maskImage: `url(${showIconSrc})`,
          }}
        />
      )}

      {!useMask && showIconSrc && (
        <img src={showIconSrc} alt="" className="menu-item-icon" />
      )}

      {!showIconSrc && icon}
    </button>
  );
}
