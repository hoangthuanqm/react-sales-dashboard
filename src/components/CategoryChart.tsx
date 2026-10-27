import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatCompact, formatCurrency } from '../utils/format'

export interface CategoryTotal {
  category: string
  revenue: number
}

export function CategoryChart({ data }: { data: CategoryTotal[] }) {
  return (
    <div className="card chart-card">
      <div className="card-header">
        <h2>Sales by category</h2>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
          <XAxis
            type="number"
            tickFormatter={(v: number) => '$' + formatCompact(v)}
            tick={{ fill: 'var(--text)', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="category"
            tick={{ fill: 'var(--text-h)', fontSize: 13 }}
            axisLine={false}
            tickLine={false}
            width={84}
          />
          <Tooltip
            cursor={{ fill: 'var(--accent-bg)' }}
            formatter={(v) => [formatCurrency(Number(v)), 'Revenue']}
            contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }}
          />
          <Bar dataKey="revenue" fill="var(--accent)" radius={[0, 6, 6, 0]} barSize={22} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
