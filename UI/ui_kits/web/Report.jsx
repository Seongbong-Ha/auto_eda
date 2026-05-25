function TypeBadge({ type }) {
  const map = {
    numeric:     { cls: "badge-num", label: "수치형" },
    categorical: { cls: "badge-cat", label: "범주형" },
    datetime:    { cls: "badge-dat", label: "날짜형" },
  };
  const m = map[type] || map.categorical;
  return <span className={"badge " + m.cls}>{m.label}</span>;
}

function StatCard({ label, value, sub }) {
  return (
    <div className="stat-card">
      <div className="stat-card-label">{label}</div>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-sub">{sub}</div>
    </div>
  );
}

function OverviewGrid({ overview }) {
  return (
    <div className="overview-grid">
      <StatCard label="행 수"   value={overview.rows.toLocaleString()} sub="rows"/>
      <StatCard label="열 수"   value={overview.columns}               sub="columns"/>
      <StatCard label="결측률" value={`${overview.missing_rate}%`}     sub="missing_rate"/>
      <StatCard label="용량"   value={`${overview.memory_mb} MB`}       sub="memory_mb"/>
    </div>
  );
}

function ColumnTable({ columns }) {
  return (
    <table className="col-table">
      <thead>
        <tr>
          <th style={{width: "30%"}}>컬럼</th>
          <th style={{width: "14%"}}>타입</th>
          <th>주요 통계</th>
          <th style={{width: "10%", textAlign: "right"}}>결측</th>
        </tr>
      </thead>
      <tbody>
        {columns.map((c) => (
          <tr key={c.name}>
            <td className="col-name">{c.name}</td>
            <td><TypeBadge type={c.type}/></td>
            <td className="col-stats">{c.stats}</td>
            <td className="col-miss">{c.missing}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

window.TypeBadge = TypeBadge;
window.StatCard = StatCard;
window.OverviewGrid = OverviewGrid;
window.ColumnTable = ColumnTable;
