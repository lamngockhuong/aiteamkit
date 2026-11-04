// A sample module the fixture documents cite.

export function handleLogin(user) {
  return user !== null;
}

export function handleLogout(session) {
  return session.close();
}

export function audit(event) {
  return event.kind;
}

export function retry(fn) {
  return fn();
}

export const MAX_SESSIONS = 5;
