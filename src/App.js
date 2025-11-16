import React, { useState } from "react";
import "./App.css";

function App() {
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [success, setSuccess] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();

    if (id === "test" && pw === "1234") {
      setSuccess(true);
    } else {
      setSuccess(false);
      alert("아이디 또는 비밀번호가 틀렸습니다!");
    }
  };

  return (
    <div className="container">
      <form className="login-box" onSubmit={handleLogin}>
        <h2 className="title">로그인</h2>

        <input
          type="text"
          placeholder="아이디"
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

        {/* 로그인 성공 메시지 */}
        {success && <p className="success-text">로그인 성공!</p>}
      </form>
    </div>
  );
}

export default App;
