const BASE = import.meta.env.VITE_API_BASE_URL ?? '';

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json();
}

/* ── Types ─────────────────────────────────────────────────────────── */

export interface Summary {
  total_inflow: number;
  lifestyle_outflow: number;
  net: number;
  fuliza_used: number;
  fuliza_repaid: number;
  merchant_spend: number;
}

export interface CategoryRow {
  type: string;
  total: number;
  count: number;
}

export interface Transaction {
  transaction_code: string;
  date: string;
  type: string;
  amount: number;
  balance: number;
  fuliza_used: number;
}

export interface TransactionsPage {
  total: number;
  page: number;
  page_size: number;
  data: Transaction[];
}

export interface TopExpense {
  transaction_code: string;
  date: string;
  type: string;
  amount: number;
}

export interface FulizaData {
  fuliza_used_total: number;
  fuliza_used_count: number;
  fuliza_repaid_total: number;
  fuliza_ratio: number;
  timeline: { date: string; value: number }[];
}

export interface UploadResult {
  imported: number;
  skipped: number;
  message: string;
}

export interface ChatResponse {
  answer: string;
}

/* ── Endpoints ─────────────────────────────────────────────────────── */

export const api = {
  getSummary: () => request<Summary>('/api/summary'),

  getCategories: () => request<CategoryRow[]>('/api/categories'),

  getTopExpenses: (limit = 5) =>
    request<TopExpense[]>(`/api/top-expenses?limit=${limit}`),

  getTransactions: (params: Record<string, string | number>) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== '' && v !== undefined && v !== null) qs.set(k, String(v));
    });
    return request<TransactionsPage>(`/api/transactions?${qs}`);
  },

  getFuliza: () => request<FulizaData>('/api/fuliza'),

  upload: async (file: File): Promise<UploadResult> => {
    const fd = new FormData();
    fd.append('file', file);
    return request<UploadResult>('/api/upload', { method: 'POST', body: fd });
  },

  chat: (message: string) =>
    request<ChatResponse>('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    }),
};
