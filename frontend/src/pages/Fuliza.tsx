import { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart,
} from 'recharts';
import { Landmark, TrendingUp, BarChart3, Percent } from 'lucide-react';
import { api, type FulizaData } from '../lib/api';
import { kes, fmtDate } from '../lib/format';

export default function Fuliza() {
  const [data, setData] = useState<FulizaData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getFuliza().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="loading-center"><div className="spinner" /></div>;
  }

  if (!data) return <p>No Fuliza data available.</p>;

  const kpis = [
    { label: 'Fuliza Used', value: kes(data.fuliza_used_total), icon: Landmark, cls: 'fuliza' },
    { label: 'Times Used', value: data.fuliza_used_count.toString(), icon: BarChart3, cls: 'outflow' },
    { label: 'Fuliza Repaid', value: kes(data.fuliza_repaid_total), icon: TrendingUp, cls: 'repaid' },
    { label: 'Fuliza / Inflow Ratio', value: `${(data.fuliza_ratio * 100).toFixed(2)}%`, icon: Percent, cls: 'net' },
  ];

  return (
    <>
      <div className="page-header">
        <h2>Fuliza Analytics</h2>
        <p>Track your Fuliza (overdraft) usage over time</p>
      </div>

      {/* KPIs */}
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

      {/* Timeline chart */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Daily Fuliza Usage Timeline</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data.timeline} margin={{ left: 10, right: 20, top: 10 }}>
            <defs>
              <linearGradient id="fulizaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis
              dataKey="date"
              stroke="var(--color-text-secondary)"
              fontSize={11}
              tickFormatter={(v: string) => {
                const d = new Date(v);
                return `${d.getDate()}/${d.getMonth() + 1}`;
              }}
            />
            <YAxis stroke="var(--color-text-secondary)" fontSize={12} tickFormatter={(v: number) => `${v}`} />
            <Tooltip
              formatter={(v: number) => [kes(v), 'Fuliza Used']}
              labelFormatter={(l: string) => fmtDate(l)}
              contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10, fontSize: 13 }}
            />
            <Area type="monotone" dataKey="value" stroke="#f59e0b" fill="url(#fulizaGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Daily breakdown table */}
      <div className="card">
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Daily Breakdown</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th style={{ textAlign: 'right' }}>Fuliza Used (KES)</th>
            </tr>
          </thead>
          <tbody>
            {data.timeline.map((t) => (
              <tr key={t.date}>
                <td>{fmtDate(t.date)}</td>
                <td className="amount-negative" style={{ textAlign: 'right' }}>{kes(t.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
