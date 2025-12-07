// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import AccountBookPage from "./pages/AccountBookPage";
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            isLoggedIn ? 
            <Navigate to="/accountbook" /> : 
            <LoginPage onLoginSuccess={() => setIsLoggedIn(true)} />
          } 
        />
        <Route 
          path="/accountbook" 
          element={
            isLoggedIn ? 
            <AccountBookPage onLogout={() => setIsLoggedIn(false)} /> : 
            <Navigate to="/" />
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
