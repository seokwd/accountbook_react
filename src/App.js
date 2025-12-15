import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import AccountBookPage from "./pages/AccountBookPage";
import InitialBalancePage from "./pages/InitialBalancePage";
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            isLoggedIn ? (
              <Navigate to="/initial-balance" />
            ) : (
              <LoginPage
                onLoginSuccess={(id) => {
                  setIsLoggedIn(true);
                  setUserId(id);
                }}
              />
            )
          }
        />

        <Route
          path="/initial-balance"
          element={
            isLoggedIn ? (
              <InitialBalancePage userId={userId} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        <Route
          path="/accountbook"
          element={
            isLoggedIn ? (
              <AccountBookPage
                userId={userId}
                onLogout={() => setIsLoggedIn(false)}
              />
            ) : (
              <Navigate to="/" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
