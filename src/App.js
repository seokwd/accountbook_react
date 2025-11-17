import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [name, setName] = useState("");

  const [success, setSuccess] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const BASE_URL = "https://unlionised-unincreasing-axel.ngrok-free.dev";

  // 로그인
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${BASE_URL}/user/login`, {
        email: id,
        password: pw,
      });
      console.log("로그인 성공:", response.data);
      setSuccess(true);
      setIsLoggedIn(true);
    } catch (error) {
      setSuccess(false);
      if (error.response && error.response.data?.error) {
        alert(error.response.data.error);
      } else {
        alert("서버 연결 오류!");
      }
    }
  };

  // 회원가입
  const handleSignup = async (e) => {
    e.preventDefault();
    if (!name || !id || !pw) {
      alert("이름, 이메일, 비밀번호를 입력해주세요.");
      return;
    }
    try {
      const response = await axios.post(`${BASE_URL}/user/signup`, {
        name,
        email: id,
        password: pw,
      });
      console.log("회원가입 성공:", response.data);
      alert("회원가입 완료되었습니다!");
      setIsSignup(false);
      setId("");
      setPw("");
      setName("");
      setSuccess(false);
    } catch (error) {
      if (error.response && error.response.data?.error) {
        alert(error.response.data.error);
      } else {
        alert("서버 연결 오류!");
      }
    }
  };

  // 로그아웃
  const handleLogout = () => {
    setIsLoggedIn(false);
    setId("");
    setPw("");
    setName("");
  };

  // ===================== 가계부 관련 =====================
  const [view, setView] = useState("수입");
  const [entryType, setEntryType] = useState("수입");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [entries, setEntries] = useState([]);

  const categoriesMap = {
    수입: ["월급", "용돈", "기타수입"],
    지출: ["식비", "교통비", "쇼핑", "기타지출"],
    물품: ["식료품", "생활용품", "기타물품"],
  };

  const handleAdd = () => {
    if (!category || !amount) {
      alert("카테고리와 금액을 입력해주세요.");
      return;
    }
    const newEntry = {
      type: entryType,
      category,
      amount,
      note,
    };
    setEntries([...entries, newEntry]);
    setCategory("");
    setAmount("");
    setNote("");
  };

  const filteredEntries = entries.filter((e) => e.type === view);

  // ===================== 렌더 =====================
  if (!isLoggedIn) {
    // 로그인 / 회원가입 화면
    return (
      <div className="container">
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

  // 가계부 화면
  return (
    <div
      className="container"
      style={{ width: "90%", maxWidth: "1200px", padding: "20px" }}
    >
      {/* 상단 버튼 그룹 + 로그아웃 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <div>
          {["수입", "지출", "물품"].map((type) => (
            <button
              key={type}
              onClick={() => setView(type)}
              style={{
                margin: "0 10px",
                padding: "10px 20px",
                backgroundColor: view === type ? "#d78f5a" : "#fff",
                color: view === type ? "#fff" : "#333",
                border: "1px solid #d78f5a",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              {type}
            </button>
          ))}
        </div>
        <button
          onClick={handleLogout}
          style={{
            backgroundColor: "#d78f5a",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "10px 20px",
            cursor: "pointer",
          }}
        >
          로그아웃
        </button>
      </div>

      {/* 입력 영역 */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        <select
          value={entryType}
          onChange={(e) => setEntryType(e.target.value)}
        >
          <option value="수입">수입</option>
          <option value="지출">지출</option>
          <option value="물품">물품</option>
        </select>

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">카테고리 선택</option>
          {categoriesMap[entryType].map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="금액"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <input
          type="text"
          placeholder="비고"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <button onClick={handleAdd}>추가</button>
      </div>

      {/* 테이블 */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>항목</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>카테고리</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>금액</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>비고</th>
          </tr>
        </thead>
        <tbody>
          {filteredEntries.map((e, idx) => (
            <tr key={idx}>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>{e.type}</td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>{e.category}</td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>{e.amount}</td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>{e.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
