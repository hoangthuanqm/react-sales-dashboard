export type OrderStatus = 'Paid' | 'Pending' | 'Refunded'

export interface Order {
  id: string
  customer: string
  email: string
  product: string
  category: string
  amount: number
  status: OrderStatus
  date: string // ISO date
}

export interface DailyPoint {
  date: string
  revenue: number
  orders: number
}

// Small seeded PRNG so the demo data is the same on every load.
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand = mulberry32(42)
const pick = <T,>(items: readonly T[]) => items[Math.floor(rand() * items.length)]

const CUSTOMERS = [
  'Olivia Martin', 'Liam Johnson', 'Emma Wilson', 'Noah Brown', 'Ava Davis',
  'Lucas Garcia', 'Mia Rodriguez', 'Ethan Miller', 'Sophia Lee', 'James Taylor',
  'Isabella Clark', 'Benjamin Lewis', 'Charlotte Walker', 'Henry Hall', 'Amelia Young',
]

const PRODUCTS: Record<string, { name: string; price: number }[]> = {
  Electronics: [
    { name: 'Wireless Headphones', price: 129 },
    { name: 'Smart Watch', price: 249 },
    { name: 'Bluetooth Speaker', price: 79 },
  ],
  Fashion: [
    { name: 'Leather Jacket', price: 189 },
    { name: 'Running Shoes', price: 119 },
  ],
  Home: [
    { name: 'Coffee Maker', price: 99 },
    { name: 'Desk Lamp', price: 45 },
  ],
  Sports: [
    { name: 'Yoga Mat', price: 35 },
    { name: 'Dumbbell Set', price: 149 },
  ],
}

export const CATEGORIES = Object.keys(PRODUCTS)

const STATUSES: OrderStatus[] = [...Array<OrderStatus>(15).fill('Paid'), 'Pending', 'Pending', 'Refunded']

const DAYS = 90
const today = new Date()
today.setHours(0, 0, 0, 0)

function isoDay(offset: number) {
  const d = new Date(today)
  d.setDate(d.getDate() - offset)
  return d.toISOString().slice(0, 10)
}

function generateOrders(): Order[] {
  const orders: Order[] = []
  let seq = 10480
  for (let offset = DAYS - 1; offset >= 0; offset--) {
    // Gentle upward trend plus weekly variation.
    const trend = 1 + (DAYS - offset) / DAYS
    const count = Math.round((4 + rand() * 6) * trend)
    for (let i = 0; i < count; i++) {
      const category = pick(CATEGORIES)
      const product = pick(PRODUCTS[category])
      const qty = 1 + Math.floor(rand() * 2)
      const customer = pick(CUSTOMERS)
      orders.push({
        id: `#${seq++}`,
        customer,
        email: customer.toLowerCase().replace(' ', '.') + '@example.com',
        product: product.name,
        category,
        amount: product.price * qty,
        status: pick(STATUSES),
        date: isoDay(offset),
      })
    }
  }
  return orders.reverse()
}

export const ORDERS = generateOrders()

export function ordersInRange(days: number, offsetDays = 0): Order[] {
  const from = isoDay(days - 1 + offsetDays)
  const to = isoDay(offsetDays)
  return ORDERS.filter((o) => o.date >= from && o.date <= to)
}

export function dailySeries(days: number): DailyPoint[] {
  const byDay = new Map<string, DailyPoint>()
  for (let offset = days - 1; offset >= 0; offset--) {
    const date = isoDay(offset)
    byDay.set(date, { date, revenue: 0, orders: 0 })
  }
  for (const o of ordersInRange(days)) {
    const point = byDay.get(o.date)
    if (point && o.status !== 'Refunded') {
      point.revenue += o.amount
      point.orders += 1
    }
  }
  return [...byDay.values()]
}
