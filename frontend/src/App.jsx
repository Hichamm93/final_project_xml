import React, { useEffect, useState } from "react";
import { getUser } from "./api";
import Navbar from "./components/Navbar";
import Toast from "./components/Toast";
import Home from "./pages/Home";
import Movie from "./pages/Movie";
import Program from "./pages/Program";
import Me from "./pages/Me";
import FilmOwner from "./pages/FilmOwner";
import CinemaOwner from "./pages/CinemaOwner";

export default function App() {
  const [route, setRoute] = useState(() => window.location.hash.replace("#", "") || "/");
  const [toast, setToast] = useState(null);

  // ✅ Auth state centralisé (réagit sans refresh)
  const [user, setUser] = useState(() => getUser());

  useEffect(() => {
    const onHash = () => setRoute(window.location.hash.replace("#", "") || "/");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const pushToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  const go = (path) => (window.location.hash = path);

  let page = null;
  if (route === "/") page = <Home go={go} toast={pushToast} />;
  else if (route.startsWith("/movie/")) page = <Movie id={parseInt(route.split("/")[2])} go={go} toast={pushToast} />;
  else if (route === "/program") page = <Program go={go} toast={pushToast} user={user} />;
  else if (route === "/me") page = <Me go={go} toast={pushToast} />;
  else if (route === "/film-owner") page = <FilmOwner go={go} toast={pushToast} />;
  else if (route === "/cinema-owner") page = <CinemaOwner go={go} toast={pushToast} />;
  else page = <Home go={go} toast={pushToast} />;

  return (
    <div className="min-h-screen">
      <Navbar route={route} go={go} user={user} setUser={setUser} toast={pushToast} />
      <div className="pt-16">{page}</div>
      {toast && <Toast text={toast} />}
    </div>
  );
}
