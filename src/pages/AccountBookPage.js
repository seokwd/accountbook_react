// pages/AccountBookPage.js
import React, { useState, useEffect } from "react";
import axios from "axios";

function AccountBookPage({ onLogout }) {
  const [view, setView] = useState("수입");
  const [entryType, setEntryType] = useState("수입");
  const [category, setCategory] = useState(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [entries, setEntries] = useState([]);
  const [categories, setCategories] = useState({ 수입: [], 지출: [], 물품: [] });

  const BASE_URL = "https://unlionised-unincreasing-axel.ngrok-free.dev";
  const USER_ID = 1;

  // 카테고리 불러오기
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/category`, {
          headers: {
            'ngrok-skip-browser-warning': 'true'
          }
        });
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

  // 트랜잭션 추가
  const handleAdd = async () => {
    if (!category || !amount) {
      return alert("카테고리와 금액을 입력해주세요.");
    }

    try {
      let url = "";
      const payload = { user_id: USER_ID, category_id: category.category_id, amount: Number(amount), note };

      if (entryType === "수입") {
        url = `${BASE_URL}/transaction/income`;
        payload.income_date = new Date().toISOString().split("T")[0];
      } else if (entryType === "지출") {
        url = `${BASE_URL}/transaction/expense`;
        payload.expense_date = new Date().toISOString().split("T")[0];
      } else if (entryType === "물품") {
        url = `${BASE_URL}/transaction/item`;
        payload.name = note || "상품";
        payload.price = Number(amount);
        payload.purchase_date = new Date().toISOString().split("T")[0];
        payload.quantity = 1;
        delete payload.amount;
      }

      const res = await axios.post(url, payload, {
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });

      const entryWithName = { ...res.data, category_name: category.name, type: entryTypeMap(entryType) };
      setEntries([entryWithName, ...entries]);

      setCategory(null);
      setAmount("");
      setNote("");
    } catch (err) {
      console.error("추가 실패:", err.response?.data || err);
      alert("추가 실패!");
    }
  };

  const entryTypeMap = (type) => {
    if (type === "income" || type === "수입") return "수입";
    if (type === "expense" || type === "지출") return "지출";
    if (type === "item" || type === "물품") return "물품";
    return type;
  };

  const filteredEntries = entries.filter((e) => e.type === view);

  const getCategoryName = (entry) => {
    const typeKey = entryTypeMap(entry.type);
    const cat = categories[typeKey].find(c => c.category_id === entry.category_id);
    return cat ? cat.name : "-";
  };

  return (
    <div className="page-container">
      <div className="accountbook-page">
        {/* 상단 네비게이션 */}
        <div className="top-nav">
          {["수입", "지출", "물품"].map(tab => (
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
          <select value={entryType} onChange={(e) => { setEntryType(e.target.value); setCategory(null); }}>
            <option value="수입">수입</option>
            <option value="지출">지출</option>
            <option value="물품">물품</option>
          </select>

          <select
            value={category?.category_id || ""}
            onChange={(e) => {
              const selected = categories[entryType].find(
                c => c.category_id === Number(e.target.value)
              );
              setCategory(selected || null);
            }}
          >
            <option value="">선택</option>
            {categories[entryType].map(cat => (
              <option key={cat.category_id} value={cat.category_id}>
                {cat.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder={entryType === "물품" ? "가격" : "금액"}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <input
            type="text"
            placeholder={entryType === "물품" ? "상품명/비고" : "비고"}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <button className="add-button" onClick={handleAdd}>추가</button>
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
                  <td>{entry.type}</td>
                  <td>{getCategoryName(entry)}</td>
                  <td>{Number(entry.amount || entry.price || 0).toLocaleString()}원</td>
                  <td>{entry.note || entry.name || "-"}</td>
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