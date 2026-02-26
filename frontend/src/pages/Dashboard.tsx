import { useEffect, useState } from 'react';
import {
  TrendingUp, TrendingDown, Activity, Landmark, CreditCard, ShoppingBag,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from 'recharts';
import { api, type Summary, type CategoryRow, type TopExpense } from '../lib/api';
import { kes, fmtDate } from '../lib/format';

export default function Dashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [topExpenses, setTopExpenses] = useState<TopExpense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getSummary(), api.getCategories(), api.getTopExpenses(5)])
      .then(([s, c, t]) => {
        setSummary(s);
        setCategories(c);
        setTopExpenses(t);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="loading-center"><div className="spinner" /></div>;
  }

  const kpis = summary
    ? [
        { label: 'Total Inflow', value: kes(summary.total_inflow), cls: 'inflow', icon: TrendingUp },
        { label: 'Lifestyle Outflow', value: kes(summary.lifestyle_outflow), cls: 'outflow', icon: TrendingDown },
        { label: 'Net Cashflow', value: kes(summary.net), cls: 'net', icon: Activity },
        { label: 'Fuliza Used', value: kes(summary.fuliza_used), cls: 'fuliza', icon: Landmark },
        { label: 'Fuliza Repaid', value: kes(summary.fuliza_repaid), cls: 'repaid', icon: CreditCard },
        { label: 'Merchant Spend', value: kes(summary.merchant_spend), cls: 'merchant', icon: ShoppingBag },
      ]
    : [];

  // Prepare category chart data (absolute values)
  const catChart = categories.map((c) => ({
    name: c.type.length > 14 ? c.type.slice(0, 14) + '…' : c.type,
    amount: Math.abs(c.total),
  }));

  return (
    <>
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Your M-PESA financial overview at a glance</p>
      </div>

      {/* KPI cards */}
      <div className="kpi-grid">
        {kpis.map((k) => (
          <div className={`kpi-card ${k.cls}`} key={k.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div className="kpi-label">{k.label}</div>
                <div className="kpi-value">{k.value}</div>
              </div>
              <k.icon size={20} style={{ color: 'var(--color-text-secondary)', opacity: 0.5 }} />
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="chart-grid">
        {/* Spending by category bar chart */}
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Spending by Category</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={catChart} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis type="number" tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`} stroke="var(--color-text-secondary)" fontSize={12} />
              <YAxis type="category" dataKey="name" width={110} stroke="var(--color-text-secondary)" fontSize={11} />
              <Tooltip
                formatter={(v: number) => [kes(v), 'Amount']}
                contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10, fontSize: 13 }}
              />
              <Bar dataKey="amount" fill="#10b981" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top expenses */}
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Top 5 Expenses</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {topExpenses.map((t) => (
                <tr key={t.transaction_code}>
                  <td>{fmtDate(t.date)}</td>
                  <td>{t.type}</td>
                  <td className="amount-negative" style={{ textAlign: 'right' }}>{kes(t.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
