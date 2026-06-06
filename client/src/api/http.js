import { API_URL, getToken, clearToken } from "./config";

/**
 * Core JSON POST helper. Attaches the auth token, parses JSON, and normalizes
 * errors into a consistent shape: { success: false, error: string }.
 *
 * On a 401 it clears the stored token so the app can redirect to login.
 */
async function post(path, body = {}, { auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.authtoken = token;
  }

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
  } catch {
    return { success: false, error: "Network error. Is the server running?" };
  }

  if (response.status === 401) {
    clearToken();
  }

  let json;
  try {
    json = await response.json();
  } catch {
    return { success: false, error: "Unexpected server response." };
  }
  return json;
}

export { post };
