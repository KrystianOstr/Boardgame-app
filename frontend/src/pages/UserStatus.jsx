import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../components/UserStatus.module.css";

const UserStatus = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState(localStorage.getItem("username"));

  // 🔥 Nasłuchiwanie zmian w localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      setUsername(localStorage.getItem("username")); // Aktualizacja stanu
    };

    // 🔥 Nasłuchiwanie na zmiany w localStorage (np. logowanie, wylogowanie)
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // 🔥 Po zalogowaniu wymuszenie ponownego renderowania
  useEffect(() => {
    const interval = setInterval(() => {
      setUsername(localStorage.getItem("username"));
    }, 500); // Co 500ms sprawdzamy status (zapobiega bugowi)

    return () => clearInterval(interval);
  }, []);

  // 🔥 Wylogowanie użytkownika
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setUsername(null);
    navigate("/"); // Po wylogowaniu przekierowanie na stronę główną
  };

  return (
    <div
      className={`${styles.statusBar} ${
        username ? styles.loggedIn : styles.loggedOut
      }`}
    >
      {username ? (
        <>
          Jesteś zalogowany jako: <strong>{username}</strong>
          <button className={styles.logoutButton} onClick={handleLogout}>
            Wyloguj
          </button>
        </>
      ) : (
        <>
          <p>Nie jesteś zalogowany!</p>
          <div className={styles.buttonContainer}>
            <button
              onClick={() => navigate("/login")}
              className={styles.authButton}
            >
              Zaloguj
            </button>
            <button
              onClick={() => navigate("/register")}
              className={styles.authButton}
            >
              Zarejestruj się
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default UserStatus;
