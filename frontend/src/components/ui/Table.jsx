export function Table({ columns, rows }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map(([, label]) => (
              <th key={label}>{label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map(([key, label, formatter]) => (
                <td key={`${row.id}-${label}`}>
                  {formatter ? formatter(row[key], row) : row[key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function TableSection({ title, subtitle, rows, columns }) {
  return (
    <section className="table-section">
      <div className="section-heading">
        <div>
          <h2>{title}</h2>
          <span>{subtitle}</span>
        </div>
        <strong>{rows.length}</strong>
      </div>
      <Table columns={columns} rows={rows} />
    </section>
  )
}
