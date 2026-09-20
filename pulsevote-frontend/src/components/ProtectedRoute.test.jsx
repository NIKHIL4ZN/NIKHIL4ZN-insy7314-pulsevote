import { render, screen } from "@testing-library/react";
import {
  MemoryRouter,
  Route,
  Routes
} from "react-router-dom";
import { describe, expect, it } from "vitest";
import ProtectedRoute from "./ProtectedRoute";

function makeToken(payload) {
  const encode = (value) =>
    btoa(JSON.stringify(value))
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

  return `${encode({
    alg: "none",
    typ: "JWT"
  })}.${encode(payload)}.signature`;
}

describe("ProtectedRoute", () => {
  it("redirects an unauthenticated visitor to login", () => {
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route
            path="/login"
            element={<p>Login page</p>}
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <p>Private dashboard</p>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(
      screen.getByText("Login page")
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Private dashboard")
    ).not.toBeInTheDocument();
  });

  it("shows protected content when a valid token is present", () => {
    localStorage.setItem(
      "token",
      makeToken({
        email: "student@test.com",
        roles: [
          {
            role: "user"
          }
        ],
        exp: Math.floor(Date.now() / 1000) + 3600
      })
    );

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route
            path="/login"
            element={<p>Login page</p>}
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <p>Private dashboard</p>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(
      screen.getByText("Private dashboard")
    ).toBeInTheDocument();
  });
});