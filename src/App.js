import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import AccountBookPage from "./pages/AccountBookPage";
import InitialBalancePage from "./pages/InitialBalancePage";
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null); // 로그인 유저 아이디 상태

  return (
    <Router>
      <Routes>
        {/* 로그인 페이지 */}
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

        {/* 초기자금 입력 페이지 (회원가입 후 한 번만 보임) */}
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

        {/* 가계부 페이지 */}
        <Route
          path="/accountbook"
          element={
            isLoggedIn ? (
              <AccountBookPage userId={userId} onLogout={() => setIsLoggedIn(false)} />
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
