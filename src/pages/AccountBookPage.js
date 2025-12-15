// src/pages/AccountBookPage.js
import React, { useState, useEffect } from "react";
import axios from "axios";

function AccountBookPage({ userId, onLogout }) {
  const [view, setView] = useState("수입");
  const [entryType, setEntryType] = useState("수입");
  const [category, setCategory] = useState(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [expiration, setExpiration] = useState("");
  const [entries, setEntries] = useState([]);
  const [categories, setCategories] = useState({ 수입: [], 지출: [], 물품: [] });
  const [initialBalance, setInitialBalance] = useState(0);


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

      // 최근 등록 순으로 내림차순 정렬 (created_at 기준)
      const allEntries = [...incomes, ...expenses, ...items].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

      setEntries(allEntries);
    } catch (err) {
      console.error("트랜잭션 조회 실패:", err);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [userId]);

  useEffect(() => {
  if (!userId) return;

  const fetchInitialBalance = async () => {
    try {
      const res = await axios.get(
        `https://unlionised-unincreasing-axel.ngrok-free.dev/balance/${userId}`,
        {
          headers: { "ngrok-skip-browser-warning": "true" },
        }
      );

      setInitialBalance(Number(res.data.current_balance || 0));
    } catch (err) {
      console.error("초기 잔액 조회 실패", err);
    }
  };

  fetchInitialBalance();
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
      } else if (entryType === "지출") {
        url = `${BASE_URL}/transaction/expense`;
        payload.amount = Number(amount);
        payload.expense_date = new Date().toISOString().slice(0, 10);
      } else if (entryType === "물품") {
        url = `${BASE_URL}/transaction/item`;
        payload.name = note || "상품";
        payload.price = Number(amount);
        payload.quantity = Number(quantity);
        payload.purchase_date = new Date().toISOString().slice(0, 10);
        payload.expiration_date = expiration || null;
      }

      await axios.post(url, payload, {
        headers: { "ngrok-skip-browser-warning": "true" },
      });

      await fetchEntries();
      setAmount("");
      setNote("");
      setCategory(null);
      setQuantity(1);
      setExpiration("");
    } catch (err) {
      console.error("추가 실패:", err);
      alert("추가 실패");
    }
  };

  // 전체금액 계산 (수입-지출, 물품 제외)
  const transactionTotal = entries.reduce((sum, e) => {
    if (e.type === "수입") return sum + Number(e.amount);
    if (e.type === "지출") return sum - Number(e.amount);
    return sum;
  }, 0);

  const totalAmount = initialBalance + transactionTotal;

  const filteredEntries = view === "전체"
    ? entries.filter((e) => e.type === "수입" || e.type === "지출")
    : entries.filter((e) => e.type === view);

  const getCategoryName = (entry) => {
    const list = categories[entry.type] || [];
    const found = list.find((c) => c.category_id === entry.category_id);
    return found ? found.name : "-";
  };

  const getRowStyle = (entry) => {
    if (view === "전체") {
      if (entry.type === "수입") return { backgroundColor: "#d4edda" }; // 연두
      if (entry.type === "지출") return { backgroundColor: "#f8d7da" }; // 빨강
    }
    return {};
  };

  const getEntryDate = (entry) => {
    if (entry.type === "수입") return entry.income_date;
    if (entry.type === "지출") return entry.expense_date;
    if (entry.type === "물품") return entry.purchase_date;
    return "";
  };


  return (
    <div className="page-container">
      <div className="accountbook-page" style={{ display: "flex", gap: "20px", flexDirection: "column" }}>
        {/* 상단 전체금액 컨테이너 */}
        <div className="balance-summary" style={{ marginBottom: "20px", textAlign: "center" }}>
          <h3>전체 금액</h3>
          <p style={{ fontSize: "20px", fontWeight: "bold" }}>{totalAmount.toLocaleString()}원</p>
        </div>

        {/* 좌측 가계부 컨테이너 */}
        <div style={{ display: "flex", gap: "20px" }}>
          <div style={{ flex: 2, display: "flex", flexDirection: "column" }}>
            <div className="top-nav">
              {["전체", "수입", "지출", "물품"].map((tab) => (
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

            <table className="data-table">
              <thead>
                <tr>
                  <th>항목</th>
                  <th>날짜</th>
                  <th>카테고리</th>
                  <th>금액</th>
                  <th>비고</th>
                  {view === "물품" && <th>수량</th>}
                  {view === "물품" && <th>유통기한</th>}
                </tr>
              </thead>
              <tbody>
                {filteredEntries.length === 0 ? (
                  <tr>
                    <td colSpan={view === "물품" ? "6" : "4"} style={{ padding: "30px", color: "#999" }}>
                      등록된 내역이 없습니다
                    </td>
                  </tr>
                ) : (
                  filteredEntries.map((e, i) => (
                    <tr key={i} style={getRowStyle(e)}>
                      <td>{e.type}</td>
                      <td>{getEntryDate(e)?.slice(0, 10)}</td>
                      <td>{getCategoryName(e)}</td>
                      <td>{Number(e.amount || e.price).toLocaleString()}원</td>
                      <td>{e.note || e.name || "-"}</td>
                      {view === "물품" && <td>{e.quantity}</td>}
                      {view === "물품" && (
                      <td>{e.expiration_date ? e.expiration_date.slice(0, 10) : "-"}</td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 우측 입력/추가 컨테이너 */}
          <div
            style={{
              flex: 1.5,
              minWidth: "300px",
              background: "white",
              padding: "20px",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              height: "440px",
              overflowY: "auto",
            }}
          >
            <h3 style={{ marginBottom: "15px" }}>내역 추가</h3>
            <div className="input-row" style={{ flexDirection: "column", alignItems: "stretch" }}>
              <select
                value={entryType}
                onChange={(e) => {
                  const newType = e.target.value;
                  setEntryType(newType);
                  setCategory(null);
                  setAmount("");
                  setNote("");
                  setQuantity(1);
                  setExpiration("");
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
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={10}   // ← 여기
                placeholder="비고 (최대 10자)"
              />

              {entryType === "물품" && (
                <>
                  <div className="quantity-wrapper">
                  <input
                    type="number"
                    placeholder="수량"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    min="1"
                  />
                  <span className="quantity-label">*수량</span>
                  </div>

                  <input
                    type="date"
                    placeholder="유통기한"
                    value={expiration}
                    onChange={(e) => setExpiration(e.target.value)}
                  />
                </>
              )}

              <button className="add-button" onClick={handleAdd} style={{ marginTop: "10px" }}>
                추가
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountBookPage;
