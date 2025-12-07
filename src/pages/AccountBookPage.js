// pages/AccountBookPage.js
import React, { useState, useEffect } from "react";
import axios from "axios";

function AccountBookPage({ onLogout }) {
  const [view, setView] = useState("수입");
  const [entryType, setEntryType] = useState("수입");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [entries, setEntries] = useState([]);
  const [categories, setCategories] = useState({ 수입: [], 지출: [], 물품: [] });

  const BASE_URL = "https://unlionised-unincreasing-axel.ngrok-free.dev";

  // 서버에서 카테고리 불러오기
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/category`); // <- 수정된 URL
        const map = { 수입: [], 지출: [], 물품: [] };
        res.data.forEach(cat => {
          if (cat.type === "income") map["수입"].push(cat);
          if (cat.type === "expense") map["지출"].push(cat);
          if (cat.type === "item") map["물품"].push(cat);
        });
        setCategories(map);
      } catch (err) {
        console.error("카테고리 불러오기 실패:", err);
      }
    };
    fetchCategories();
  }, []);

  const handleAdd = async () => {
    if (!category || !amount) {
      alert("카테고리와 금액을 입력해주세요.");
      return;
    }

    try {
      const categoryId = category.category_id; // 선택한 category 객체에서 ID
      const newEntry = {
        type: entryType,
        category_id: categoryId,
        amount: Number(amount),
        note,
      };

      const res = await axios.post(`${BASE_URL}/transactions`, newEntry);
      setEntries([res.data, ...entries]);
      setCategory("");
      setAmount("");
      setNote("");
    } catch (err) {
      console.error("추가 실패:", err.response?.data || err);
      alert("추가 실패!");
    }
  };

  const entryTypeMap = (type) => {
    if (type === "income") return "수입";
    if (type === "expense") return "지출";
    if (type === "item") return "물품";
    return type;
  };

  const filteredEntries = entries.filter((e) => entryTypeMap(e.type) === view);

  return (
    <div className="page-container">
      <div className="accountbook-page">
        {/* 상단 네비게이션 */}
        <div className="top-nav">
          {["수입", "지출", "물품"].map((tab) => (
            <button
              key={tab}
              className={`nav-btn ${view === tab ? "active" : ""}`}
              onClick={() => setView(tab)}
            >
              {tab}
            </button>
          ))}
          <button className="logout-btn" onClick={onLogout}>
            로그아웃
          </button>
        </div>

        {/* 입력 영역 */}
        <div className="input-row">
          <select value={entryType} onChange={(e) => setEntryType(e.target.value)}>
            <option value="수입">수입</option>
            <option value="지출">지출</option>
            <option value="물품">물품</option>
          </select>

          <select
            value={category.category_id || ""}
            onChange={(e) => {
              const selected = categories[entryType].find(
                (c) => c.category_id === Number(e.target.value)
              );
              setCategory(selected);
            }}
          >
            <option value="">선택</option>
            {categories[entryType].map((cat) => (
              <option key={cat.category_id} value={cat.category_id}>
                {cat.name}
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

          <button className="add-button" onClick={handleAdd}>
            추가
          </button>
        </div>

        {/* 테이블 */}
        <table className="data-table">
          <thead>
            <tr>
              <th>항목</th>
              <th>카테고리</th>
              <th>금액</th>
              <th>비고</th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ padding: "40px", color: "#999" }}>
                  등록된 내역이 없습니다
                </td>
              </tr>
            ) : (
              filteredEntries.map((entry, idx) => (
                <tr key={idx}>
                  <td>{entryTypeMap(entry.type)}</td>
                  <td>{entry.category_name}</td>
                  <td>{entry.amount.toLocaleString()}</td>
                  <td>{entry.note || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AccountBookPage;
