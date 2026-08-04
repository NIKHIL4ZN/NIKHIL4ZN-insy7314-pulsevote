import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../utils/auth";

export default function LogoutPage() {
  const navigate = useNavigate();

  useEffect(() => {
    logout();
    navigate("/", { replace: true });
  }, [navigate]);

  return (
    <div className="card">
      <p>Logging out...</p>
    </div>
  );
}