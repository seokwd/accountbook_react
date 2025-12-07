// components/Navbar.js
import React from "react";

function Navbar({ view, setView, onLogout }) {
  return (
    <nav className="navbar">
      <div className="nav-tabs">
        <button
          onClick={() => setView("수입")}
          className={view === "수입" ? "nav-tab active" : "nav-tab"}
        >
          수입
        </button>
        <button
          onClick={() => setView("지출")}
          className={view === "지출" ? "nav-tab active" : "nav-tab"}
        >
          지출
        </button>
        <button
          onClick={() => setView("물품")}
          className={view === "물품" ? "nav-tab active" : "nav-tab"}
        >
          물품
        </button>
        <button className="nav-logout" onClick={onLogout}>
          로그아웃
        </button>
      </div>
    </nav>
  );
}

export default Navbar;