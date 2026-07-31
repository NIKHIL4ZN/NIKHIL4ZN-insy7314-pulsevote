import {
  Outlet,
  NavLink,
  useLocation
} from "react-router-dom";
import { useEffect, useState } from "react";

export default function Layout() {
  const [loggedIn, setLoggedIn] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setLoggedIn(!!localStorage.getItem("token"));
  }, [location]);

  return (
    <div className="app-shell">
      <header>
        <h1>PulseVote</h1>

        <nav>
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            Home
          </NavLink>

          {!loggedIn && (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  isActive ? "active" : ""
                }
              >
                Login
              </NavLink>

              <NavLink
                to="/register"
                className={({ isActive }) =>
                  isActive ? "active" : ""
                }
              >
                Register
              </NavLink>
            </>
          )}

          {loggedIn && (
            <>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  isActive ? "active" : ""
                }
              >
                Dashboard
              </NavLink>

              <NavLink
                to="/logout"
                className={({ isActive }) =>
                  isActive ? "active" : ""
                }
              >
                Logout
              </NavLink>
            </>
          )}
        </nav>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}