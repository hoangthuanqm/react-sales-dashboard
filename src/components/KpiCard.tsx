interface KpiCardProps {
  label: string
  value: string
  change: number
  /** Set when a decrease is the good outcome (e.g. refund rate). */
  lowerIsBetter?: boolean
}

export function KpiCard({ label, value, change, lowerIsBetter = false }: KpiCardProps) {
  const up = change >= 0
  const good = up !== lowerIsBetter
  return (
    <div className="card kpi">
      <span className="kpi-label">{label}</span>
      <span className="kpi-value">{value}</span>
      <span className={`kpi-change ${good ? 'up' : 'down'}`}>
        {up ? '▲' : '▼'} {Math.abs(change).toFixed(1)}%
        <span className="kpi-hint"> vs previous period</span>
      </span>
    </div>
  )
}
