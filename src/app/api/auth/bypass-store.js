// Simple in-memory store for dev-only bypassed users
const store = new Map();

export function saveBypassUser(email, user) {
  store.set(email, user);
}

export function getBypassUser(email) {
  return store.get(email);
}
