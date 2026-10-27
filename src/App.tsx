import { useMemo, useState } from 'react'
import './App.css'
import { CategoryChart } from './components/CategoryChart'
import { KpiCard } from './components/KpiCard'
import { OrdersTable } from './components/OrdersTable'
import { RevenueChart } from './components/RevenueChart'
import { CATEGORIES, dailySeries, ordersInRange, type Order } from './data/mockData'
import { formatCurrency, percentChange } from './utils/format'

const RANGES = [7, 30, 90] as const
type Range = (typeof RANGES)[number]

function summarize(orders: Order[]) {
  const paid = orders.filter((o) => o.status !== 'Refunded')
  const revenue = paid.reduce((sum, o) => sum + o.amount, 0)
  const customers = new Set(paid.map((o) => o.customer)).size
  const refunds = orders.length - paid.length
  return {
    revenue,
    orders: paid.length,
    avgOrder: paid.length ? revenue / paid.length : 0,
    customers,
    refundRate: orders.length ? (refunds / orders.length) * 100 : 0,
  }
}

export default function App() {
  const [range, setRange] = useState<Range>(30)

  const { kpis, series, categories, orders } = useMemo(() => {
    const orders = ordersInRange(range)
    const current = summarize(orders)
    // The 90-day view has no full previous period in the dataset, so compare with the first half instead.
    const previous = summarize(range === 90 ? ordersInRange(45, 45) : ordersInRange(range, range))
    const scale = range === 90 ? 0.5 : 1

    const categories = CATEGORIES.map((category) => ({
      category,
      revenue: orders
        .filter((o) => o.category === category && o.status !== 'Refunded')
        .reduce((sum, o) => sum + o.amount, 0),
    })).sort((a, b) => b.revenue - a.revenue)

    return {
      kpis: [
        { label: 'Total revenue', value: formatCurrency(current.revenue), change: percentChange(current.revenue * scale, previous.revenue) },
        { label: 'Orders', value: current.orders.toLocaleString(), change: percentChange(current.orders * scale, previous.orders) },
        { label: 'Avg. order value', value: formatCurrency(current.avgOrder), change: percentChange(current.avgOrder, previous.avgOrder) },
        { label: 'Refund rate', value: current.refundRate.toFixed(1) + '%', change: percentChange(current.refundRate, previous.refundRate), lowerIsBetter: true },
      ],
      series: dailySeries(range),
      categories,
      orders,
    }
  }, [range])

  return (
    <div className="layout">
      <header className="topbar">
        <div className="brand">
          <span className="logo">S</span>
          <div>
            <h1>Sales Dashboard</h1>
            <p className="muted">Overview of your store performance</p>
          </div>
        </div>
        <div className="segmented" role="tablist" aria-label="Date range">
          {RANGES.map((r) => (
            <button key={r} role="tab" aria-selected={range === r} className={range === r ? 'active' : ''} onClick={() => setRange(r)}>
              {r} days
            </button>
          ))}
        </div>
      </header>

      <section className="kpi-grid">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </section>

      <section className="chart-grid">
        <RevenueChart data={series} />
        <CategoryChart data={categories} />
      </section>

      <OrdersTable key={range} orders={orders} />

      <footer className="muted small">Demo data · Built with React, TypeScript, Vite and Recharts</footer>
    </div>
  )
}
