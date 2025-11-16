import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [success, setSuccess] = useState(false);

  const BASE_URL = "https://unlionised-unincreasing-axel.ngrok-free.dev"; // 네 백엔드 주소

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${BASE_URL}/user/login`, {
        email: id,
        password: pw
      });

      console.log("로그인 성공:", response.data);
      setSuccess(true);

    } catch (error) {
      setSuccess(false);

      if (error.response) {
        alert(error.response.data.error);
      } else {
        alert("서버 연결 오류!");
      }
    }
  };

  return (
    <div className="container">
      <form className="login-box" onSubmit={handleLogin}>
        <h2 className="title">로그인</h2>

        <input
          type="text"
          placeholder="아이디(이메일)"
          value={id}
          onChange={(e) => setId(e.target.value)}
        />

        <input
          type="password"
          placeholder="비밀번호"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
        />

        <button type="submit">로그인</button>

        {success && <p className="success-text">로그인 성공!</p>}
      </form>
    </div>
  );
}

export default App;
