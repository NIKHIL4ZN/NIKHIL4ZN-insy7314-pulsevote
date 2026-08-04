import AdminDashboard from "../components/AdminDashboard";
import ManagerDashboard from "../components/ManagerDashboard";
import UserDashboard from "../components/UserDashboard";
import { getCurrentUser, hasRole } from "../utils/auth";

export default function DashboardPage() {
  const user = getCurrentUser();

  return (
    <div className="dashboard-page">
      <section className="card account-summary">
        <h2>Dashboard</h2>
        <p>Signed in as <strong>{user?.email}</strong></p>
      </section>
      {hasRole("admin") && <AdminDashboard />}
      {hasRole("manager") && <ManagerDashboard />}
      {hasRole("user") && <UserDashboard />}
    </div>
  );
}