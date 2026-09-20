import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Register from "./Register";
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

describe("Register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects mismatched passwords before calling the API", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    await user.type(
      screen.getByLabelText("Email"),
      "newuser@test.com"
    );

    await user.type(
      screen.getByLabelText("Password", { selector: "input" }),
      "Password123!"
    );

    await user.type(
      screen.getByLabelText("Confirm password"),
      "Different123!"
    );

    await user.click(
      screen.getByRole("button", { name: "Register" })
    );

    expect(
      screen.getByText("Passwords do not match.")
    ).toBeInTheDocument();

    expect(
      api.post
    ).not.toHaveBeenCalled();
  });

  it("registers the user, stores the token and navigates to the dashboard", async () => {
    const user = userEvent.setup();

    api.post.mockResolvedValueOnce({
      data: {
        token: "registered.jwt.token"
      }
    });

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    await user.type(
      screen.getByLabelText("Email"),
      "newuser@test.com"
    );

    await user.type(
      screen.getByLabelText("Password", { selector: "input" }),
      "Password123!"
    );

    await user.type(
      screen.getByLabelText("Confirm password"),
      "Password123!"
    );

    await user.click(
      screen.getByRole("button", { name: "Register" })
    );

    expect(api.post).toHaveBeenCalledWith(
      "/auth/register-user",
      {
        email: "newuser@test.com",
        password: "Password123!"
      }
    );

    expect(
      localStorage.getItem("token")
    ).toBe("registered.jwt.token");

    expect(
      navigate
    ).toHaveBeenCalledWith("/dashboard");
  });
});