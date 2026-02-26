const SESSION_KEY = "gpis_session";
const VALID_USERNAME = "global Pride international school";
const VALID_PASSWORD = "gpis@8320";

export function useAuth() {
  function login(username: string, password: string): boolean {
    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      localStorage.setItem(SESSION_KEY, "true");
      return true;
    }
    return false;
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
  }

  function isAuthenticated(): boolean {
    try {
      return localStorage.getItem(SESSION_KEY) === "true";
    } catch {
      return false;
    }
  }

  return { login, logout, isAuthenticated };
}
