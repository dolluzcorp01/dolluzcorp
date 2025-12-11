import React, { useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from "./Login";
import Home from "./Home";

function App() {
  const [navSize, setNavSize] = useState("full");
  const location = useLocation();

  const path = location.pathname.toLowerCase();
  const shouldHideNavbar = path === "/login" || path === "/thank-you";

  // ✅ Optional: force scroll to top on route change (helps prevent UI glitches)
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      {/* ✅ Render Login & Thank You separately */}
      {shouldHideNavbar ? (
        <Routes>
          <Route path="/" element={<Navigate to="/Login" />} />
          <Route path="/Login" element={<Login />} />
        </Routes>
      ) : (
        // ✅ Main layout only for logged-in sections
        <div className="main-layout">
          <div className={`main-content ${navSize}`}>
            <Routes>
              <Route path="/" element={<Navigate to="/Login" />} />
              <Route path="/Home" element={<Home navSize={navSize} />} />
            </Routes>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
