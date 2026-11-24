const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export function token() { return localStorage.getItem('skillspring_token'); }
export async function api<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string,string> = { 'Content-Type': 'application/json', ...(options.headers as Record<string,string> || {}) };
  if (token()) headers.Authorization = `Bearer ${token()}`;
  const response = await fetch(`${API}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || `Request failed (${response.status})`);
  return data as T;
}
export type User = { id: string; _id?: string; name: string; email: string; role: 'learner'|'instructor'|'admin' };
export type Course = { _id: string; title: string; summary: string; description: string; category: string; level: string; thumbnail?: string; averageRating: number; reviewCount: number; instructor: { name: string }; status?: string; outcomes?: string[]; prerequisites?: string[]; sections?: any[]; quiz?: any[] };
