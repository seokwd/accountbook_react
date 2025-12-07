// components/TransactionTable.js
import React from "react";

function TransactionTable({ entries, view }) {
  if (entries.length === 0) {
    return (
      <div className="table-container">
        <div className="empty-state">
          <p>📝 등록된 {view} 내역이 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="transaction-table">
        <thead>
          <tr>
            <th>날짜</th>
            <th>항목</th>
            <th>카테고리</th>
            <th>금액</th>
            <th>비고</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, idx) => (
            <tr key={idx}>
              <td className="date-col">{entry.date}</td>
              <td className="type-col">{entry.type}</td>
              <td className="category-col">
                <span className="category-badge">{entry.category}</span>
              </td>
              <td className="amount-col">{entry.amount.toLocaleString()}원</td>
              <td className="note-col">{entry.note || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TransactionTable;