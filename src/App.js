import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [id, setId] = useState("");       // 이메일(아이디)
  const [pw, setPw] = useState("");       // 비밀번호
  const [name, setName] = useState("");   // 회원가입용 이름

  const [success, setSuccess] = useState(false);
  const [isSignup, setIsSignup] = useState(false); // 화면 전환: false = 로그인, true = 회원가입

  const BASE_URL = "https://unlionised-unincreasing-axel.ngrok-free.dev"; // 백엔드 주소

  /* ----------------------- 로그인 함수 ----------------------- */
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${BASE_URL}/user/login`, {
        email: id,
        password: pw,
      });

      console.log("로그인 성공:", response.data);
      setSuccess(true);
      // 필요하면 response.data에서 토큰/유저 정보 저장 처리
    } catch (error) {
      setSuccess(false);
      if (error.response && error.response.data && error.response.data.error) {
        alert(error.response.data.error);
      } else {
        alert("서버 연결 오류!");
      }
    }
  };

  /* ----------------------- 회원가입 함수 (수정된 엔드포인트) ----------------------- */
  const handleSignup = async (e) => {
    e.preventDefault();

    // 간단한 프론트 검증
    if (!name || !id || !pw) {
      alert("이름, 이메일, 비밀번호를 모두 입력해주세요.");
      return;
    }

    try {
      // <-- 여기서 중요: /user/signup 으로 호출해야 백엔드와 일치합니다.
      const response = await axios.post(`${BASE_URL}/user/signup`, {
        name: name,
        email: id,
        password: pw,
      });

      console.log("회원가입 성공:", response.data);
      alert("회원가입 완료되었습니다!");

      // 회원가입 후 로그인 화면으로 복귀 및 입력 초기화
      setIsSignup(false);
      setId("");
      setPw("");
      setName("");
      setSuccess(false);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        alert(error.response.data.error);
      } else {
        alert("서버 연결 오류!");
      }
    }
  };

  return (
    <div className="container">
      <form
        className="login-box"
        onSubmit={isSignup ? handleSignup : handleLogin}
      >
        <h2 className="title">{isSignup ? "회원가입" : "로그인"}</h2>

        {/* 회원가입일 때만 이름 입력 필드 표시 */}
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

        {/* 하단 전환 버튼 (색상/스타일은 기존 CSS에 따름) */}
        <button
          type="button"
          onClick={() => {
            setIsSignup(!isSignup);
            setSuccess(false);
            // 화면 전환 시 입력 초기화(원하면 제거 가능)
            setId("");
            setPw("");
            setName("");
          }}
          style={{ marginTop: "8px" }}
        >
          {isSignup ? "처음화면으로" : "회원가입"}
        </button>

        {/* 로그인 성공 메시지 */}
        {!isSignup && success && (
          <p className="success-text">로그인 성공!</p>
        )}
      </form>
    </div>
  );
}

export default App;
