import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function InitialBalancePage({ userId }) {
  const [balance, setBalance] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const BASE_URL = "https://unlionised-unincreasing-axel.ngrok-free.dev";

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/balance/${userId}`, {
          headers: { "ngrok-skip-browser-warning": "true" },
        });

        if (res.data.current_balance && res.data.current_balance > 0) {
          navigate("/accountbook");
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("잔액 조회 실패:", err);
        setLoading(false);
      }
    };

    fetchBalance();
  }, [userId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amount = Number(balance);
    if (isNaN(amount) || amount < 0) {
      alert("0 이상의 숫자를 입력해주세요.");
      return;
    }

    try {
      await axios.post(
        `${BASE_URL}/balance/init`,
        { user_id: userId, initial_balance: amount },
        { headers: { "ngrok-skip-browser-warning": "true" } }
      );
      navigate("/accountbook");
    } catch (err) {
      console.error("초기자금 등록 실패:", err);
      alert("등록 실패. 다시 시도해주세요.");
    }
  };

  if (loading) return <div>로딩 중...</div>;

  return (
    <div className="centered-page-container">
      <div className="login-box">
        <h2 className="title">초기 자금 입력</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="number"
            placeholder="초기 자금 입력"
            value={balance}
            min="0"
            onChange={(e) => setBalance(e.target.value)}
            required
          />
          <button type="submit">등록</button>
        </form>
      </div>
    </div>
  );
}

export default InitialBalancePage;
