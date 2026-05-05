import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://aura-backend-production.up.railway.app';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const t = localStorage.getItem('aura_token');
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

api.interceptors.response.use(
  (response) => {
    const d = response.data;
    if (d && typeof d === 'object' && 'success' in d && 'data' in d) {
      response.data = d.data;
    }
    return response;
  },
  (error) => {
    const envelope = error?.response?.data;
    const msg =
      (envelope && typeof envelope === 'object' && envelope.message) ||
      (envelope && typeof envelope === 'object' && envelope.error) ||
      error.message ||
      'An error occurred';
    if (error.response) error.response.data = { error: msg, message: msg };
    return Promise.reject(error);
  }
);

export default api;

export function mediaUrl(url: string | null | undefined): string {
  if (!url) return 'https://placehold.co/400x400/18152a/9d94b8?text=AURA';
  if (url.startsWith('http')) return url;
  return `${BASE_URL}${url}`;
}
