import React, { useState, useEffect } from "react";
import axios from "axios";

function AccountBookPage({ userId, onLogout }) {
  const [view, setView] = useState("수입");
  const [entryType, setEntryType] = useState("수입");
  const [category, setCategory] = useState(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [entries, setEntries] = useState([]);
  const [categories, setCategories] = useState({ 수입: [], 지출: [], 물품: [] });

  const BASE_URL = "https://unlionised-unincreasing-axel.ngrok-free.dev";

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/category`, {
          headers: { "ngrok-skip-browser-warning": "true" },
        });

        const map = { 수입: [], 지출: [], 물품: [] };
        res.data.forEach((cat) => {
          if (cat.type === "income") map["수입"].push(cat);
          if (cat.type === "expense") map["지출"].push(cat);
          if (cat.type === "item") map["물품"].push(cat);
        });

        setCategories(map);
      } catch (err) {
        console.error("카테고리 조회 실패:", err);
      }
    };

    fetchCategories();
  }, []);

  const fetchEntries = async () => {
    if (!userId) return;

    try {
      const [incomeRes, expenseRes, itemRes] = await Promise.all([
        axios.get(`${BASE_URL}/transaction/income/${userId}`, {
          headers: { "ngrok-skip-browser-warning": "true" },
        }),
        axios.get(`${BASE_URL}/transaction/expense/${userId}`, {
          headers: { "ngrok-skip-browser-warning": "true" },
        }),
        axios.get(`${BASE_URL}/transaction/item/${userId}`, {
          headers: { "ngrok-skip-browser-warning": "true" },
        }),
      ]);

      const incomes = Array.isArray(incomeRes.data)
        ? incomeRes.data.map((v) => ({ ...v, type: "수입" }))
        : [];
      const expenses = Array.isArray(expenseRes.data)
        ? expenseRes.data.map((v) => ({ ...v, type: "지출" }))
        : [];
      const items = Array.isArray(itemRes.data)
        ? itemRes.data.map((v) => ({ ...v, type: "물품" }))
        : [];

      setEntries([...incomes, ...expenses, ...items]);
    } catch (err) {
      console.error("트랜잭션 조회 실패:", err);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [userId]);

  const handleAdd = async () => {
    if (!category || !amount) {
      alert("카테고리와 금액을 입력해주세요.");
      return;
    }

    try {
      let url = "";
      const payload = { user_id: userId, category_id: category.category_id, note };

      if (entryType === "수입") {
        url = `${BASE_URL}/transaction/income`;
        payload.amount = Number(amount);
        payload.income_date = new Date().toISOString().slice(0, 10);
      }

      if (entryType === "지출") {
        url = `${BASE_URL}/transaction/expense`;
        payload.amount = Number(amount);
        payload.expense_date = new Date().toISOString().slice(0, 10);
      }

      if (entryType === "물품") {
        url = `${BASE_URL}/transaction/item`;
        payload.name = note || "상품";
        payload.price = Number(amount);
        payload.quantity = 1;
        payload.purchase_date = new Date().toISOString().slice(0, 10);
      }

      await axios.post(url, payload, {
        headers: { "ngrok-skip-browser-warning": "true" },
      });

      await fetchEntries();

      setAmount("");
      setNote("");
      setCategory(null);
    } catch (err) {
      console.error("추가 실패:", err);
      alert("추가 실패");
    }
  };

  const filteredEntries = entries.filter((e) => e.type === view);

  const getCategoryName = (entry) => {
    const list = categories[entry.type] || [];
    const found = list.find((c) => c.category_id === entry.category_id);
    return found ? found.name : "-";
  };

  return (
    <div className="page-container">
      <div className="accountbook-page">
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

        <div className="input-row">
          <select
            value={entryType}
            onChange={(e) => {
              setEntryType(e.target.value);
              setCategory(null);
            }}
          >
            <option value="수입">수입</option>
            <option value="지출">지출</option>
            <option value="물품">물품</option>
          </select>

          <select
            value={category?.category_id || ""}
            onChange={(e) => {
              const selected = categories[entryType].find(
                (c) => c.category_id === Number(e.target.value)
              );
              setCategory(selected || null);
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
                <td colSpan="4" style={{ padding: "30px", color: "#999" }}>
                  등록된 내역이 없습니다
                </td>
              </tr>
            ) : (
              filteredEntries.map((e, i) => (
                <tr key={i}>
                  <td>{e.type}</td>
                  <td>{getCategoryName(e)}</td>
                  <td>{Number(e.amount || e.price).toLocaleString()}원</td>
                  <td>{e.note || e.name || "-"}</td>
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
