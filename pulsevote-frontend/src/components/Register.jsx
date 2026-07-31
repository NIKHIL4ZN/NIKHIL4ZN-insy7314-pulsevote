import { useState } from "react";
import axios from "axios";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isStrongPassword = (password) =>
  /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/.test(password);

  const register = async () => {
    setError("");
    setSuccess("");

    if (!email || !password) {
  setError("Email and password are required.");
  return;
}

if (!isValidEmail(email)) {
  setError("Invalid email format.");
  return;
}

if (!isStrongPassword(password)) {
  setError("Password must be at least 8 characters long and include letters and numbers.");
  return;
}

    try {
      const response = await axios.post(
        "https://localhost:5000/api/auth/register",
        {
          email,
          password
        }
      );

      localStorage.setItem("token", response.data.token);
      setSuccess("Registered and logged in!");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Error registering."
      );
    }
  };

  return (
    <div>
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {success && (
        <div className="success-message">
          {success}
        </div>
      )}

      <input
        type="email"
        placeholder="Email"
        onChange={(event) => setEmail(event.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        onChange={(event) => setPassword(event.target.value)}
      />

      <button onClick={register}>
        Register
      </button>
    </div>
  );
}