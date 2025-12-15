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

  // 이번 달 예산 관련 상태
  const [payday, setPayday] = useState("");
  const [fixedAmount, setFixedAmount] = useState("");
  const [fixedNote, setFixedNote] = useState("");
  const [totalFixedExpense, setTotalFixedExpense] = useState(0);
  const [totalExpenseThisMonth, setTotalExpenseThisMonth] = useState(0);

  const BASE_URL = "https://unlionised-unincreasing-axel.ngrok-free.dev";

  // 카테고리 조회
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

  // 트랜잭션 조회
  const fetchEntries = async () => {
    if (!userId) return;
    try {
      const [incomeRes, expenseRes, itemRes] = await Promise.all([
        axios.get(`${BASE_URL}/transaction/income/${userId}`, { headers: { "ngrok-skip-browser-warning": "true" } }),
        axios.get(`${BASE_URL}/transaction/expense/${userId}`, { headers: { "ngrok-skip-browser-warning": "true" } }),
        axios.get(`${BASE_URL}/transaction/item/${userId}`, { headers: { "ngrok-skip-browser-warning": "true" } }),
      ]);

      const incomes = Array.isArray(incomeRes.data) ? incomeRes.data.map((v) => ({ ...v, type: "수입" })) : [];
      const expenses = Array.isArray(expenseRes.data) ? expenseRes.data.map((v) => ({ ...v, type: "지출" })) : [];
      const items = Array.isArray(itemRes.data) ? itemRes.data.map((v) => ({ ...v, type: "물품" })) : [];

      const allEntries = [...incomes, ...expenses, ...items].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

      setEntries(allEntries);

      // 이번 달 지출 합계 계산
      const monthExpenses = expenses.filter((e) => {
        const d = new Date(e.expense_date);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
      const sum = monthExpenses.reduce((acc, e) => acc + Number(e.amount), 0);
      setTotalExpenseThisMonth(sum);

      // 고정 지출 합계 조회
      const fixedRes = await axios.get(`${BASE_URL}/fixed-expense/${userId}`, {
        headers: { "ngrok-skip-browser-warning": "true" },
      });
      const fixedSum = fixedRes.data.reduce((acc, e) => acc + Number(e.amount), 0);
      setTotalFixedExpense(fixedSum);

    } catch (err) {
      console.error("트랜잭션 조회 실패:", err);
    }
  };

  useEffect(() => { fetchEntries(); }, [userId]);

  // 초기 잔액 조회
  useEffect(() => {
    if (!userId) return;
    const fetchInitialBalance = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/balance/${userId}`, {
          headers: { "ngrok-skip-browser-warning": "true" },
        });
        setInitialBalance(Number(res.data.current_balance || 0));
      } catch (err) {
        console.error("초기 잔액 조회 실패", err);
      }
    };
    fetchInitialBalance();
  }, [userId]);

  // 내역 추가
  const handleAdd = async () => {
    if (!category || !amount) return alert("카테고리와 금액을 입력해주세요.");
    try {
      const payload = { user_id: userId, category_id: category.category_id, note };
      let url = "";
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
      await axios.post(url, payload, { headers: { "ngrok-skip-browser-warning": "true" } });
      await fetchEntries();
      setAmount(""); setNote(""); setCategory(null); setQuantity(1); setExpiration("");
    } catch (err) {
      console.error("추가 실패:", err); alert("추가 실패");
    }
  };

  // 삭제
  const handleDelete = async (entry) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      let url = "", idField = "";
      if (entry.type === "수입") { url = `${BASE_URL}/transaction/income`; idField = "income_id"; }
      else if (entry.type === "지출") { url = `${BASE_URL}/transaction/expense`; idField = "expense_id"; }
      else if (entry.type === "물품") { url = `${BASE_URL}/transaction/item`; idField = "item_id"; }
      if (!entry[idField]) { alert("삭제할 항목 ID가 없습니다."); return; }
      await axios.delete(`${url}/${entry[idField]}`, { headers: { "ngrok-skip-browser-warning": "true" } });
      alert("삭제 완료"); fetchEntries();
    } catch (err) {
      console.error("삭제 실패:", err); alert("삭제 실패");
    }
  };

  // 고정 지출 추가
  const handleAddFixedExpense = async () => {
    if (!fixedAmount) return alert("금액을 입력하세요.");
    try {
      const payload = {
        user_id: userId,
        amount: Number(fixedAmount),
        note: fixedNote,
        day_of_month: payday ? new Date(payday).getDate() : 1,
        category_id: 1,
      };
      await axios.post(`${BASE_URL}/fixed-expense`, payload, { headers: { "ngrok-skip-browser-warning": "true" } });
      alert("고정 지출 추가 완료");
      setFixedAmount(""); setFixedNote("");
      fetchEntries(); // 갱신
    } catch (err) {
      console.error("고정 지출 추가 실패:", err); alert("고정 지출 추가 실패");
    }
  };

  const transactionTotal = entries.reduce((sum, e) => {
    if (e.type === "수입") return sum + Number(e.amount);
    if (e.type === "지출") return sum - Number(e.amount);
    return sum;
  }, 0);
  const totalAmount = initialBalance + transactionTotal;

  const filteredEntries = view === "전체" || view === "삭제"
    ? entries
    : entries.filter((e) => e.type === view);

  const getCategoryName = (entry) => {
    const list = categories[entry.type] || [];
    const found = list.find((c) => c.category_id === entry.category_id);
    return found ? found.name : "-";
  };

  const getRowStyle = (entry) => {
    if (view === "전체" || view === "삭제") {
      if (entry.type === "수입") return { backgroundColor: "#d4edda" };
      if (entry.type === "지출") return { backgroundColor: "#f8d7da" };
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
        <div className="balance-summary" style={{ marginBottom: "20px", textAlign: "center" }}>
          <h3>전체 금액</h3>
          <p style={{ fontSize: "20px", fontWeight: "bold" }}>{totalAmount.toLocaleString()}원</p>
        </div>

        <div style={{ display: "flex", gap: "20px" }}>
          {/* 좌측: 필터 + 테이블 */}
          <div style={{ flex: 2, background: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column" }}>
            <div className="top-nav" style={{ display: "flex", gap: "10px", borderBottom: "2px solid #ddd", paddingBottom: "5px", marginBottom: "20px" }}>
              {["전체", "수입", "지출", "물품", "삭제"].map((tab) => (
                <button key={tab} onClick={() => setView(tab)}
                  style={{
                    background: "none", border: "none", padding: "10px 15px", cursor: "pointer",
                    fontWeight: view === tab ? "bold" : "normal", color: view === tab ? "#d78f5a" : "#333",
                    borderBottom: view === tab ? "3px solid #d78f5a" : "3px solid transparent",
                    transition: "color 0.2s, border-bottom 0.2s"
                  }}>
                  {tab}
                </button>
              ))}
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>항목</th><th>날짜</th><th>카테고리</th><th>금액</th><th>비고</th>
                  {view !== "삭제" && (view === "물품" ? <><th>수량</th><th>유통기한</th></> : null)}
                  {view === "삭제" && <th>삭제</th>}
                </tr>
              </thead>
              <tbody>
                {filteredEntries.length === 0 ? (
                  <tr><td colSpan={view === "물품" || view === "삭제" ? 7 : 5} style={{ padding: "30px", color: "#999" }}>등록된 내역이 없습니다</td></tr>
                ) : (
                  filteredEntries.map((e, i) => (
                    <tr key={i} style={getRowStyle(e)}>
                      <td>{e.type}</td>
                      <td>{getEntryDate(e)?.slice(0, 10)}</td>
                      <td>{getCategoryName(e)}</td>
                      <td>{Number(e.amount || e.price).toLocaleString()}원</td>
                      <td>{e.note || e.name || "-"}</td>
                      {view !== "삭제" && (view === "물품") && <td>{e.quantity}</td>}
                      {view !== "삭제" && (view === "물품") && <td>{e.expiration_date ? e.expiration_date.slice(0, 10) : "-"}</td>}
                      {view === "삭제" && (
                        <td><button style={{ color: "black", cursor: "pointer", border: "none", background: "transparent" }} onClick={() => handleDelete(e)}>X</button></td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 우측: 입력 + 예산 */}
          <div style={{ flex: 1.5, minWidth: "300px", display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* 내역 추가 */}
            {/* 내역 추가 */}
            <div style={{ 
              background: "white", 
              padding: "20px", 
              borderRadius: "8px", 
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              height: "fit-content"
            }}>
              <h3 style={{ marginBottom: "15px", fontSize: "18px", fontWeight: "600" }}>내역 추가</h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {/* 유형 선택 */}
                <div>
                  <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: "500" }}>
                    항목
                  </label>
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
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #ddd",
                      borderRadius: "6px",
                      fontSize: "14px"
                    }}
                  >
                    <option value="수입">수입</option>
                    <option value="지출">지출</option>
                    <option value="물품">물품</option>
                  </select>
                </div>

                {/* 카테고리 선택 */}
                <div>
                  <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: "500" }}>
                    카테고리 *
                  </label>
                  <select 
                    value={category?.category_id || ""} 
                    onChange={(e) => {
                      const selected = categories[entryType].find(
                        (c) => c.category_id === Number(e.target.value)
                      );
                      setCategory(selected || null);
                    }}
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #ddd",
                      borderRadius: "6px",
                      fontSize: "14px"
                    }}
                  >
                    <option value="">카테고리를 선택하세요</option>
                    {categories[entryType].map((cat) => (
                      <option key={cat.category_id} value={cat.category_id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 금액 입력 */}
                <div>
                  <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: "500" }}>
                    금액 *
                  </label>
                  <input 
                    type="number" 
                    placeholder="금액을 입력하세요" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)}
                    min="0"
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #ddd",
                      borderRadius: "6px",
                      fontSize: "14px"
                    }}
                  />
                </div>

                {/* 비고 입력 */}
                <div>
                  <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: "500" }}>
                    비고
                  </label>
                  <input 
                    type="text" 
                    value={note} 
                    onChange={(e) => setNote(e.target.value)} 
                    maxLength={10} 
                    placeholder="비고 (최대 10자)"
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #ddd",
                      borderRadius: "6px",
                      fontSize: "14px"
                    }}
                  />
                </div>

                {/* 물품 전용 입력 */}
                {entryType === "물품" && (
                  <>
                    <div>
                      <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: "500" }}>
                        수량
                      </label>
                      <input 
                        type="number" 
                        placeholder="수량" 
                        value={quantity} 
                        onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))} 
                        min="1"
                        style={{
                          width: "100%",
                          padding: "10px",
                          border: "1px solid #ddd",
                          borderRadius: "6px",
                          fontSize: "14px"
                        }}
                      />
                    </div>
                    
                    <div>
                      <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: "500" }}>
                        유통기한
                      </label>
                      <input 
                        type="date" 
                        value={expiration} 
                        onChange={(e) => setExpiration(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px",
                          border: "1px solid #ddd",
                          borderRadius: "6px",
                          fontSize: "14px"
                        }}
                      />
                    </div>
                  </>
                )}

                {/* 추가 버튼 */}
                <button 
                  className="add-button" 
                  onClick={handleAdd}
                  style={{ 
                    marginTop: "10px",
                    padding: "12px",
                    backgroundColor: "#d78f5a",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "16px",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  추가하기
                </button>
              </div>
            </div>

            {/* 이번달 예산 */}
            <div style={{ 
              background: "white", 
              padding: "20px", 
              borderRadius: "8px", 
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              height: "fit-content"
            }}>
              <h3 style={{ marginBottom: "15px", fontSize: "18px", fontWeight: "600" }}>이번 달 예산</h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {/* 고정 지출 추가 */}
                <div style={{ 
                  padding: "15px", 
                  background: "#f8f9fa", 
                  borderRadius: "6px",
                  border: "1px solid #e9ecef"
                }}>
                  <label style={{ display: "block", marginBottom: "10px", fontSize: "14px", fontWeight: "500" }}>
                    고정 지출 추가
                  </label>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <input 
                      type="number" 
                      placeholder="금액을 입력하세요" 
                      value={fixedAmount} 
                      onChange={(e) => setFixedAmount(e.target.value)} 
                      min="0"
                      style={{ 
                        width: "100%",
                        padding: "10px", 
                        border: "1px solid #ddd", 
                        borderRadius: "6px",
                        fontSize: "14px",
                        backgroundColor: "white"
                      }} 
                    />
                    <input 
                      type="text" 
                      placeholder="설명 (예: 월세, 통신비)" 
                      value={fixedNote} 
                      onChange={(e) => setFixedNote(e.target.value)} 
                      style={{ 
                        width: "100%",
                        padding: "10px", 
                        border: "1px solid #ddd", 
                        borderRadius: "6px",
                        fontSize: "14px",
                        backgroundColor: "white"
                      }} 
                    />
                    <button 
                      className="add-button" 
                      onClick={handleAddFixedExpense}
                      style={{ 
                        marginTop: "5px",
                        padding: "10px",
                        backgroundColor: "#d78f5a",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "14px",
                        fontWeight: "600",
                        cursor: "pointer"
                      }}
                    >
                      고정 지출 추가
                    </button>
                  </div>
                </div>

                {/* 예산 요약 */}
                <div style={{ 
                  padding: "15px", 
                  background: "#f7ece5ff", 
                  borderRadius: "6px",
                  border: "1px solid #ffe9d0ff"
                }}>
                  <h4 style={{ 
                    marginBottom: "12px", 
                    fontSize: "15px", 
                    fontWeight: "600",
                    color: "#333"
                  }}>
                    예산 현황
                  </h4>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ 
                      display: "flex", 
                      justifyContent: "space-between",
                      fontSize: "14px"
                    }}>
                      <span style={{ color: "#666" }}>전체 금액:</span>
                      <span style={{ fontWeight: "600", color: "#2196F3" }}>
                        {totalAmount.toLocaleString()}원
                      </span>
                    </div>
                    
                    <div style={{ 
                      display: "flex", 
                      justifyContent: "space-between",
                      fontSize: "14px"
                    }}>
                      <span style={{ color: "#666" }}>고정 지출:</span>
                      <span style={{ fontWeight: "600", color: "#ff6b6b" }}>
                        -{totalFixedExpense.toLocaleString()}원
                      </span>
                    </div>
                    
                    <div style={{ 
                      display: "flex", 
                      justifyContent: "space-between",
                      fontSize: "14px"
                    }}>
                      <span style={{ color: "#666" }}>이번 달 지출:</span>
                      <span style={{ fontWeight: "600", color: "#ff6b6b" }}>
                        -{totalExpenseThisMonth.toLocaleString()}원
                      </span>
                    </div>
                    
                    <div style={{ 
                      height: "1px", 
                      background: "#d0e7ff", 
                      margin: "8px 0" 
                    }}></div>
                    
                    <div style={{ 
                      display: "flex", 
                      justifyContent: "space-between",
                      fontSize: "16px"
                    }}>
                      <span style={{ fontWeight: "600", color: "#333" }}>남은 예산:</span>
                      <span style={{ 
                        fontWeight: "700", 
                        color: (totalAmount - totalFixedExpense - totalExpenseThisMonth) < 0 ? "#ff6b6b" : "#4CAF50",
                        fontSize: "18px"
                      }}>
                        {(totalAmount - totalFixedExpense - totalExpenseThisMonth).toLocaleString()}원
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountBookPage;
