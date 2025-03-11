import { useState } from "react";
import styles from "../components/Login.module.css"; // Import CSS Modules
import "../global.css"; // Import globalnych styli

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleEmailChange = (e) => setEmail(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(`Email: ${email}, Hasło: ${password}`);
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.card}>
          <h2 className="title">Logowanie</h2>

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
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
