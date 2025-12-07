import React, { useState } from "react";

function AccountBookPage({ onLogout }) {
  const [view, setView] = useState("물품");
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
      amount: Number(amount),
      note,
    };
    setEntries([newEntry, ...entries]);
    setCategory("");
    setAmount("");
    setNote("");
  };

  const filteredEntries = entries.filter((e) => e.type === view);

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
          <select
            value={entryType}
            onChange={(e) => setEntryType(e.target.value)}
          >
            <option value="수입">수입</option>
            <option value="지출">지출</option>
            <option value="물품">물품</option>
          </select>

          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">선택</option>
            {categoriesMap[entryType].map((cat) => (
              <option key={cat}>{cat}</option>
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
                  <td>{entry.type}</td>
                  <td>{entry.category}</td>
                  <td>{entry.amount}</td>
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
