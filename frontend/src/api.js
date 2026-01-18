const API = "http://localhost:8000";

export function getToken() {
  return localStorage.getItem("token");
}

export function setAuth(auth) {
  localStorage.setItem("token", auth.token);
  localStorage.setItem("user", JSON.stringify(auth.user));
}

export function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function getUser() {
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
}

async function req(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const t = getToken();
    if (t) headers.Authorization = `Bearer ${t}`;
  }
  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.detail || "Erreur API");
  }
  return data;
}

export const api = {
  health: () => req("/health"),
  login: (payload) => req("/auth/login", { method: "POST", body: payload }),
  registerClient: (payload) => req("/auth/register-client", { method: "POST", body: payload }),

  featured: () => req("/films/featured"),
  films: (q) => req(q ? `/films?q=${encodeURIComponent(q)}` : "/films"),
  filmDetail: (id) => req(`/films/${id}`),

  cities: () => req("/cities"),
  program: (city) => req(city ? `/program?city=${encodeURIComponent(city)}` : "/program"),

  reserve: (payload) => req("/reservations", { method: "POST", body: payload, auth: true }),
  myReservations: () => req("/me/reservations", { auth: true }),

  ownerFilms: () => req("/owner/films", { auth: true }),
  ownerCreateFilm: (payload) => req("/owner/films", { method: "POST", body: payload, auth: true }),
  ownerUpdateFilm: (id, payload) => req(`/owner/films/${id}`, { method: "PATCH", body: payload, auth: true }),
  ownerDeleteFilm: (id) => req(`/owner/films/${id}`, { method: "DELETE", auth: true }),
  ownerProgrammed: () => req("/owner/films/programmed", { auth: true }),

  myCinemas: () => req("/cinema/mine", { auth: true }),
  cinemaScreenings: () => req("/cinema/screenings", { auth: true }),
  cinemaCreateScreening: (payload) => req("/cinema/screenings", { method: "POST", body: payload, auth: true }),
  cinemaUpdateScreening: (id, payload) => req(`/cinema/screenings/${id}`, { method: "PATCH", body: payload, auth: true }),
  cinemaDeleteScreening: (id) => req(`/cinema/screenings/${id}`, { method: "DELETE", auth: true })
};
