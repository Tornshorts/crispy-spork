import { useEffect, useState, useCallback } from 'react';
import { Search, Download, X } from 'lucide-react';
import { api, type Transaction, type TransactionsPage } from '../lib/api';
import { kes, fmtDateTime } from '../lib/format';

export default function Transactions() {
  const [data, setData] = useState<TransactionsPage | null>(null);
  const [loading, setLoading] = useState(true);

  // filters
  const [search, setSearch] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [type, setType] = useState('');
  const [minAmt, setMinAmt] = useState('');
  const [maxAmt, setMaxAmt] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 15;

  // drawer
  const [selected, setSelected] = useState<Transaction | null>(null);

  const loadData = useCallback(() => {
    setLoading(true);
    api
      .getTransactions({
        q: search,
        start,
        end,
        type,
        min: minAmt,
        max: maxAmt,
        page,
        page_size: pageSize,
      })
      .then(setData)
      .finally(() => setLoading(false));
  }, [search, start, end, type, minAmt, maxAmt, page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalPages = data ? Math.ceil(data.total / pageSize) : 0;

  const exportCSV = () => {
    if (!data) return;
    const header = 'Transaction Code,Date,Type,Amount,Balance,Fuliza Used';
    const rows = data.data.map(
      (t) => `${t.transaction_code},${t.date},${t.type},${t.amount},${t.balance},${t.fuliza_used}`,
    );
    const blob = new Blob([header + '\n' + rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2>Transactions</h2>
          <p>{data ? `${data.total} transactions found` : 'Loading…'}</p>
        </div>
        <button className="btn btn-secondary" onClick={exportCSV}>
          <Download size={15} /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="filter-group" style={{ flex: 1, minWidth: 200 }}>
          <label>Search</label>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--color-text-secondary)' }} />
            <input
              className="input"
              style={{ paddingLeft: 36, maxWidth: '100%' }}
              placeholder="Code or type…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </div>
        <div className="filter-group">
          <label>From</label>
          <input className="input" type="date" value={start} onChange={(e) => { setStart(e.target.value); setPage(1); }} />
        </div>
        <div className="filter-group">
          <label>To</label>
          <input className="input" type="date" value={end} onChange={(e) => { setEnd(e.target.value); setPage(1); }} />
        </div>
        <div className="filter-group">
          <label>Type</label>
          <input className="input" placeholder="e.g. Merchant Payment" value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} />
        </div>
        <div className="filter-group">
          <label>Min (KES)</label>
          <input className="input" type="number" value={minAmt} onChange={(e) => { setMinAmt(e.target.value); setPage(1); }} />
        </div>
        <div className="filter-group">
          <label>Max (KES)</label>
          <input className="input" type="number" value={maxAmt} onChange={(e) => { setMaxAmt(e.target.value); setPage(1); }} />
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'auto' }}>
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Code</th>
                <th>Type</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th style={{ textAlign: 'right' }}>Balance</th>
              </tr>
            </thead>
            <tbody>
              {data?.data.map((t) => (
                <tr key={t.transaction_code} onClick={() => setSelected(t)} style={{ cursor: 'pointer' }}>
                  <td>{fmtDateTime(t.date)}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{t.transaction_code}</td>
                  <td>{t.type}</td>
                  <td className={t.amount >= 0 ? 'amount-positive' : 'amount-negative'} style={{ textAlign: 'right' }}>
                    {t.amount >= 0 ? '+' : '-'}{kes(t.amount)}
                  </td>
                  <td style={{ textAlign: 'right' }}>{kes(t.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}>← Prev</button>
          <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
            Page {page} of {totalPages}
          </span>
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next →</button>
        </div>
      )}

      {/* Row detail drawer */}
      {selected && (
        <>
          <div className="drawer-overlay" onClick={() => setSelected(null)} />
          <div className="drawer">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Transaction Detail</h3>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)' }}>
                <X size={20} />
              </button>
            </div>
            {[
              ['Code', selected.transaction_code],
              ['Date', fmtDateTime(selected.date)],
              ['Type', selected.type],
              ['Amount', kes(selected.amount)],
              ['Balance', kes(selected.balance)],
              ['Fuliza Used', kes(selected.fuliza_used)],
            ].map(([label, value]) => (
              <div className="detail-row" key={label}>
                <span className="label">{label}</span>
                <span>{value}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
