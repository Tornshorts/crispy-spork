import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid,
} from 'recharts';
import { api, type CategoryRow } from '../lib/api';
import { kes } from '../lib/format';

const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#06b6d4'];

export default function Categories() {
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    api.getCategories().then(setCategories).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="loading-center"><div className="spinner" /></div>;
  }

  const chartData = categories.map((c) => ({
    name: c.type,
    amount: Math.abs(c.total),
    count: c.count,
  })).sort((a, b) => b.amount - a.amount);

  const total = chartData.reduce((sum, c) => sum + c.amount, 0);

  const detail = selected ? categories.find((c) => c.type === selected) : null;

  return (
    <>
      <div className="page-header">
        <h2>Categories</h2>
        <p>Spending breakdown by transaction type</p>
      </div>

      <div className="chart-grid">
        {/* Bar chart */}
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Category Breakdown</h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData} margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis
                dataKey="name"
                stroke="var(--color-text-secondary)"
                fontSize={11}
                angle={-35}
                textAnchor="end"
                height={80}
                tickFormatter={(v: string) => v.length > 12 ? v.slice(0, 12) + '…' : v}
              />
              <YAxis stroke="var(--color-text-secondary)" fontSize={12} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip
                formatter={(v: number) => [kes(v), 'Amount']}
                contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10, fontSize: 13 }}
              />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]} cursor="pointer" onClick={(d: { name: string }) => setSelected(d.name)}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Detail / list */}
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
            {detail ? `${detail.type} Detail` : 'All Categories'}
          </h3>

          {detail ? (
            <div>
              <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Total Spent</span>
                <span style={{ fontWeight: 700 }}>{kes(detail.total)}</span>
              </div>
              <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Transactions</span>
                <span style={{ fontWeight: 700 }}>{detail.count}</span>
              </div>
              <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Avg per Transaction</span>
                <span style={{ fontWeight: 700 }}>{kes(detail.total / detail.count)}</span>
              </div>
              <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>% of Total Spending</span>
                <span style={{ fontWeight: 700 }}>{((Math.abs(detail.total) / total) * 100).toFixed(1)}%</span>
              </div>
              <button className="btn btn-secondary" style={{ marginTop: 16 }} onClick={() => setSelected(null)}>
                ← Back to all
              </button>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                  <th style={{ textAlign: 'right' }}>Count</th>
                  <th style={{ textAlign: 'right' }}>%</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((c, i) => (
                  <tr key={c.name} onClick={() => setSelected(c.name)} style={{ cursor: 'pointer' }}>
                    <td>
                      <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: COLORS[i % COLORS.length], marginRight: 8 }} />
                      {c.name}
                    </td>
                    <td className="amount-negative" style={{ textAlign: 'right' }}>{kes(c.amount)}</td>
                    <td style={{ textAlign: 'right' }}>{c.count}</td>
                    <td style={{ textAlign: 'right' }}>{((c.amount / total) * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
