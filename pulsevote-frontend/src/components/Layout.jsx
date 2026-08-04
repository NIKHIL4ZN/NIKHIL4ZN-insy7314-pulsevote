import { Outlet, NavLink, useLocation } from "react-router-dom";
import { getCurrentUser } from "../utils/auth";

export default function Layout() {
  useLocation();
  const loggedIn = Boolean(getCurrentUser());

  return (
    <div className="app-shell">
      <header>
        <h1>PulseVote</h1>
        <nav>
          <NavLink to="/">Home</NavLink>
          {!loggedIn && <NavLink to="/login">Login</NavLink>}
          {!loggedIn && <NavLink to="/register">Register</NavLink>}
          {loggedIn && <NavLink to="/dashboard">Dashboard</NavLink>}
          {loggedIn && <NavLink to="/logout">Logout</NavLink>}
        </nav>
      </header>
      <main><Outlet /></main>
    </div>
  );
}