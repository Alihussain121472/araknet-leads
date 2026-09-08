export async function apiFetch(input: RequestInfo | URL, init?: RequestInit) {
  const response = await fetch(input, init);
  if (response.status === 401) { window.location.assign('/login'); throw new Error('Your session expired. Please sign in again.'); }
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `Request failed (${response.status}). Please retry.`);
  }
  return response;
}
