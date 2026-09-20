import { render, screen } from "@testing-library/react";
import {
  beforeEach,
  describe,
  expect,
  it,
  vi
} from "vitest";

import DashboardPage from "./DashboardPage";
import {
  getCurrentUser,
  hasRole
} from "../utils/auth";

vi.mock("../components/AdminDashboard", () => ({
  default: () => <div>ADMIN AREA</div>
}));

vi.mock("../components/ManagerDashboard", () => ({
  default: () => <div>MANAGER AREA</div>
}));

vi.mock("../components/UserDashboard", () => ({
  default: () => <div>USER AREA</div>
}));

vi.mock("../utils/auth", () => ({
  getCurrentUser: vi.fn(),
  hasRole: vi.fn()
}));

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows the dashboards for every role assigned to the account", () => {
    getCurrentUser.mockReturnValue({
      email: "multi@test.com"
    });

    hasRole.mockImplementation(
      (role) =>
        role === "manager" ||
        role === "user"
    );

    render(<DashboardPage />);

    expect(
      screen.getByText("multi@test.com")
    ).toBeInTheDocument();

    expect(
      screen.getByText("MANAGER AREA")
    ).toBeInTheDocument();

    expect(
      screen.getByText("USER AREA")
    ).toBeInTheDocument();

    expect(
      screen.queryByText("ADMIN AREA")
    ).not.toBeInTheDocument();
  });
});