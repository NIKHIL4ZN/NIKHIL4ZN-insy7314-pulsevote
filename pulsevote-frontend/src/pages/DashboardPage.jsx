import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [authorized, setAuthorized] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      setAuthorized(true);
    } else {
      setAuthorized(false);
    }
  }, []);

  return (
    <div className="card">
      <h2>Dashboard</h2>

      {authorized === false && (
        <div className="error-message">
          You are not authorized to access this content.
        </div>
      )}

      {authorized === true && (
        <div className="success-message">
          You are authorized and can see this protected content.
        </div>
      )}
    </div>
  );
}