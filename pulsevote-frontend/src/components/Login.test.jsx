import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Login from "./Login";
import api from "../api/api";

const navigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");

  return {
    ...actual,
    useNavigate: () => navigate
  };
});

vi.mock("../api/api", () => ({
  default: {
    post: vi.fn()
  }
}));

describe("Login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the login form and can show the password", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");

    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute("type", "password");

    await user.click(screen.getByLabelText("Show password"));

    expect(passwordInput).toHaveAttribute("type", "text");
  });

  it("shows the API error when login fails", async () => {
    const user = userEvent.setup();

    api.post.mockRejectedValueOnce({
      response: {
        data: {
          message: "Invalid credentials"
        }
      }
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await user.type(
      screen.getByLabelText("Email"),
      "student@test.com"
    );

    await user.type(
      screen.getByLabelText("Password"),
      "WrongPassword1"
    );

    await user.click(
      screen.getByRole("button", { name: "Login" })
    );

    expect(api.post).toHaveBeenCalledWith("/auth/login", {
      email: "student@test.com",
      password: "WrongPassword1"
    });

    expect(
      await screen.findByText("Invalid credentials")
    ).toBeInTheDocument();
  });

  it("stores the token and navigates to the dashboard after a successful login", async () => {
    const user = userEvent.setup();

    api.post.mockResolvedValueOnce({
      data: {
        token: "test.jwt.token"
      }
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await user.type(
      screen.getByLabelText("Email"),
      "student@test.com"
    );

    await user.type(
      screen.getByLabelText("Password"),
      "Password123!"
    );

    await user.click(
      screen.getByRole("button", { name: "Login" })
    );

    expect(
      localStorage.getItem("token")
    ).toBe("test.jwt.token");

    expect(
      navigate
    ).toHaveBeenCalledWith("/dashboard");
  });
});