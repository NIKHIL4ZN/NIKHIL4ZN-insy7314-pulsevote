import { Navigate } from "react-router-dom";
import { getCurrentUser } from "../utils/auth";

export default function ProtectedRoute({ children }) {
  return getCurrentUser()
    ? children
    : <Navigate to="/login" replace />;
}