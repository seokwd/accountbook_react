import React, { useState } from "react";
import axios from "axios";

function LoginPage({ onLoginSuccess }) {
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [name, setName] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [success, setSuccess] = useState(false);

  const BASE_URL = "https://unlionised-unincreasing-axel.ngrok-free.dev";

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${BASE_URL}/user/login`, {
        email: id,
        password: pw,
      });
      console.log("로그인 성공:", response.data);
      setSuccess(true);
      // ✅ user_id를 받아서 그대로 전달
      onLoginSuccess(response.data.user_id);
    } catch (error) {
      setSuccess(false);
      if (error.response?.data?.error) {
        alert(error.response.data.error);
      } else {
        alert("서버 연결 오류!");
      }
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!name || !id || !pw) {
      alert("이름, 이메일, 비밀번호를 입력해주세요.");
      return;
    }
    try {
      await axios.post(`${BASE_URL}/user/signup`, {
        name,
        email: id,
        password: pw,
      });
      alert("회원가입 완료되었습니다!");
      setIsSignup(false);
      setName("");
      setId("");
      setPw("");
      setSuccess(false);
    } catch (error) {
      if (error.response?.data?.error) {
        alert(error.response.data.error);
      } else {
        alert("서버 연결 오류!");
      }
    }
  };

  return (
    <div className="centered-page-container">
      <form
        className="login-box"
        onSubmit={isSignup ? handleSignup : handleLogin}
      >
        <h2 className="title">{isSignup ? "회원가입" : "로그인"}</h2>

        {isSignup && (
          <input
            type="text"
            placeholder="이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}

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

        <button type="submit">{isSignup ? "회원가입" : "로그인"}</button>

        <button
          type="button"
          onClick={() => {
            setIsSignup(!isSignup);
            setSuccess(false);
            setId("");
            setPw("");
            setName("");
          }}
          style={{ marginTop: "8px" }}
        >
          {isSignup ? "처음화면으로" : "회원가입"}
        </button>

        {!isSignup && success && (
          <p className="success-text">로그인 성공!</p>
        )}
      </form>
    </div>
  );
}

export default LoginPage;
