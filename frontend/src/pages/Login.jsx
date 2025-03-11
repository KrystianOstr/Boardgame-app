import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../components/Login.module.css"; // Import CSS Modules
import "../global.css"; // Import globalnych styli

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleEmailChange = (e) => setEmail(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Błąd logowania.");
        return;
      }

      // 🔥 Zapisanie tokena i nazwy użytkownika w localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username);

      // 🔥 Automatyczne przekierowanie na listę gier
      navigate("/tables");
    } catch {
      setError("Błąd połączenia z serwerem.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className="title">Logowanie</h2>

        {error && (
          <p className={`${styles.message} ${styles.error}`}>{error}</p>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>Email:</label>
          <input
            type="text"
            value={email}
            onChange={handleEmailChange}
            className="input"
          />

          <label className={styles.label}>Hasło:</label>
          <input
            type="password"
            value={password}
            onChange={handlePasswordChange}
            className="input"
          />

          <button type="submit" className="button">
            Zaloguj
          </button>
          <button
            onClick={() => navigate("/register")}
            className={styles.registerButton}
          >
            Zarejestruj się
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
