export async function apiFetch(path: string, options: RequestInit = {}, fallbackHost = "http://localhost:5000") {
  // Try relative fetch first (works with Vite proxy)
  try {
    const res = await fetch(path, options);
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("text/html") || !res.ok) {
      // attempt direct backend fetch
      const direct = await fetch(fallbackHost + path, options);
      return direct;
    }
    return res;
  } catch (err) {
    // network error — try direct backend
    return fetch(fallbackHost + path, options);
  }
}

export async function apiJson(path: string, options: RequestInit = {}, fallbackHost = "http://localhost:5000") {
  const res = await apiFetch(path, options, fallbackHost);
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  const text = await res.text().catch(() => null);
  try { return JSON.parse(text as string); } catch { return text; }
}
