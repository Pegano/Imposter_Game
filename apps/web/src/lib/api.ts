// Base API URL — Vite proxy forwards /api to backend
const BASE = '/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  const json = await res.json()
  if (!json.success) throw new Error(json.error ?? 'Onbekende fout')
  return json.data as T
}

// ── Types ────────────────────────────────────────────────────
export interface ApiPlayer {
  id: string
  name: string
  avatarId: string
  groupId: string | null
  createdAt: string
  updatedAt: string
}

export interface ApiGroup {
  id: string
  name: string
  players: ApiPlayer[]
  createdAt: string
  updatedAt: string
}

// ── Categories ───────────────────────────────────────────────
export interface ApiCategory {
  id: string
  name: string
  icon: string | null
  isDefault: boolean
  wordCount: number
  createdAt: string
  updatedAt: string
}

export interface ApiWord {
  id: string
  word: string
  hintEasy: string
  hintMedium: string
  hintHard: string
  categoryId: string
  createdAt: string
  updatedAt: string
}

export const categoriesApi = {
  getAll: () => request<ApiCategory[]>('/categories'),

  create: (name: string, icon?: string) =>
    request<ApiCategory>('/categories', {
      method: 'POST',
      body: JSON.stringify({ name, icon }),
    }),

  update: (id: string, name: string, icon?: string) =>
    request<ApiCategory>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name, icon }),
    }),

  delete: (id: string) =>
    request<void>(`/categories/${id}`, { method: 'DELETE' }),
}

// ── Words ─────────────────────────────────────────────────────
export const wordsApi = {
  getRandom: (categoryId?: string) =>
    request<ApiWord>(`/words/random${categoryId ? `?categoryId=${categoryId}` : ''}`),

  getByCategory: (categoryId: string) =>
    request<ApiWord[]>(`/words?categoryId=${categoryId}`),

  create: (data: { categoryId: string; word: string; hintEasy: string; hintMedium: string; hintHard: string }) =>
    request<ApiWord>('/words', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: { word: string; hintEasy: string; hintMedium: string; hintHard: string }) =>
    request<ApiWord>(`/words/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<void>(`/words/${id}`, { method: 'DELETE' }),
}

// ── AI Generatie ──────────────────────────────────────────────
export const generateApi = {
  words: (categoryId: string, categoryName: string, count = 20) =>
    request<ApiWord[]>('/generate/words', {
      method: 'POST',
      body: JSON.stringify({ categoryId, categoryName, count }),
    }),
}

// ── Groups ───────────────────────────────────────────────────
export const groupsApi = {
  getAll: () => request<ApiGroup[]>('/groups'),

  create: (name: string, players: { name: string; avatarId: string }[]) =>
    request<ApiGroup>('/groups', {
      method: 'POST',
      body: JSON.stringify({ name, players }),
    }),

  rename: (id: string, name: string) =>
    request<ApiGroup>(`/groups/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    }),

  delete: (id: string) =>
    request<void>(`/groups/${id}`, { method: 'DELETE' }),

  addPlayer: (groupId: string, name: string, avatarId: string) =>
    request<ApiPlayer>(`/groups/${groupId}/players`, {
      method: 'POST',
      body: JSON.stringify({ name, avatarId }),
    }),

  removePlayer: (groupId: string, playerId: string) =>
    request<void>(`/groups/${groupId}/players/${playerId}`, { method: 'DELETE' }),
}
