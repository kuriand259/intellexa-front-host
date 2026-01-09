import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Sidebar.css";
import MenuItem from "../MenuItem/MenuItem";


import HomeIcon from "../../assets/home.png";
import SearchIcon from "../../assets/search.png";
import ChatbotIcon from "../../assets/bot.svg";
import ChatModal from "../ChatModal/ChatModal";
import CompareIcon from "../../assets/scale.svg";

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* ... header ... */}
      <div className="sidebar-header">
        <div
          style={{
            width: 20,
            height: 20,
            background: "white",
            transform: "rotate(45deg)",
          }}
        />
      </div>

      {/* Render Modal here or outside? Inside is fine as it's portal/fixed or just overlay */}
      <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      <nav className="sidebar-nav">
        <MenuItem
          iconSrc={HomeIcon}
          active={location.pathname === "/"}
          onClick={() => { navigate("/"); onClose?.(); }}
          ariaLabel="Home"
        />

        <MenuItem
          iconSrc={SearchIcon}
          active={location.pathname === "/search"}
          onClick={() => { navigate("/search"); onClose?.(); }}
          ariaLabel="Search"
        />

        <MenuItem
          iconSrc={CompareIcon} // Using SearchIcon as placeholder for Compare
          useMask={false}
          active={location.pathname === "/compare"}
          onClick={() => { navigate("/compare"); onClose?.(); }}
          ariaLabel="Compare"
        />
      </nav>

      <div className="sidebar-footer">
        <MenuItem
          iconSrc={ChatbotIcon}
          useMask={false}
          active={isChatOpen} // Active state follows modal open state
          onClick={() => setIsChatOpen(!isChatOpen)}
          onMouseDown={(e) => e.stopPropagation()} // Prevent document listener from firing (closes modal)
          ariaLabel="Chatbot"
          className="chatbot-item"
        />
      </div>
    </aside>
  );
}
