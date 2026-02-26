const SESSION_KEY = 'gpis_session';
const VALID_USERNAME = 'global Pride international school';
const VALID_PASSWORD = 'gpis@8320';

export function login(username: string, password: string): boolean {
  if (username === VALID_USERNAME && password === VALID_PASSWORD) {
    localStorage.setItem(SESSION_KEY, 'true');
    return true;
  }
  return false;
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function isAuthenticated(): boolean {
  return localStorage.getItem(SESSION_KEY) === 'true';
}
