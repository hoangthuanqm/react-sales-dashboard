import { useMemo, useState } from 'react'
import type { Order, OrderStatus } from '../data/mockData'
import { formatCurrency, formatShortDate } from '../utils/format'

type SortKey = 'date' | 'amount' | 'customer'
const PAGE_SIZE = 8

export function OrdersTable({ orders }: { orders: Order[] }) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<OrderStatus | 'All'>('All')
  const [sort, setSort] = useState<{ key: SortKey; desc: boolean }>({ key: 'date', desc: true })
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const rows = orders.filter(
      (o) =>
        (status === 'All' || o.status === status) &&
        (!q || o.customer.toLowerCase().includes(q) || o.product.toLowerCase().includes(q) || o.id.includes(q)),
    )
    const dir = sort.desc ? -1 : 1
    return [...rows].sort((a, b) => {
      const av = a[sort.key]
      const bv = b[sort.key]
      return (av < bv ? -1 : av > bv ? 1 : 0) * dir
    })
  }, [orders, search, status, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(page, totalPages)
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)

  const toggleSort = (key: SortKey) =>
    setSort((s) => ({ key, desc: s.key === key ? !s.desc : true }))

  const arrow = (key: SortKey) => (sort.key === key ? (sort.desc ? ' ↓' : ' ↑') : '')

  return (
    <div className="card">
      <div className="card-header table-toolbar">
        <h2>Recent orders</h2>
        <div className="toolbar-controls">
          <input
            type="search"
            placeholder="Search customer, product, order…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as OrderStatus | 'All')
              setPage(1)
            }}
          >
            <option value="All">All statuses</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Refunded">Refunded</option>
          </select>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th className="sortable" onClick={() => toggleSort('customer')}>Customer{arrow('customer')}</th>
              <th>Product</th>
              <th className="sortable" onClick={() => toggleSort('date')}>Date{arrow('date')}</th>
              <th>Status</th>
              <th className="sortable num" onClick={() => toggleSort('amount')}>Amount{arrow('amount')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.id}>
                <td className="mono">{o.id}</td>
                <td>
                  <div className="customer">{o.customer}</div>
                  <div className="muted small">{o.email}</div>
                </td>
                <td>
                  {o.product}
                  <div className="muted small">{o.category}</div>
                </td>
                <td>{formatShortDate(o.date)}</td>
                <td>
                  <span className={`badge ${o.status.toLowerCase()}`}>{o.status}</span>
                </td>
                <td className="num">{formatCurrency(o.amount)}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="empty">No orders match your filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <span className="muted">
          {filtered.length} orders · page {current} of {totalPages}
        </span>
        <div>
          <button disabled={current <= 1} onClick={() => setPage(current - 1)}>Previous</button>
          <button disabled={current >= totalPages} onClick={() => setPage(current + 1)}>Next</button>
        </div>
      </div>
    </div>
  )
}
