import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from "./Login";
import Home from "./Home";
import UpdateDetails from "./UpdateDetails";

function App() {
  const [navSize, setNavSize] = useState("full");
  const location = useLocation();

  const path = location.pathname.toLowerCase();
  const shouldHideNavbar = path === "/login" || path === "/thank-you";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />

        {/* UPDATE DETAILS – MUST BE GLOBAL */}
        <Route path="/update/:id" element={<UpdateDetails />} />

        {/* AUTHENTICATED AREA */}
        <Route
          path="/home"
          element={
            <div className="main-layout">
              <div className={`main-content ${navSize}`}>
                <Home navSize={navSize} />
              </div>
            </div>
          }
        />
      </Routes>
    </>
  );
}

export default App;
