import { useState } from "react";
import styles from "../components/Register.module.css"; // Import CSS Modules
import "../global.css"; // Import globalnych styli

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    const validationErrors = [];
    if (!formData.username.trim()) {
      validationErrors.push("Nazwa użytkownika jest wymagana.");
    }

    if (
      !formData.email.includes("@") ||
      (!formData.email.endsWith(".com") && !formData.email.endsWith(".pl"))
    ) {
      validationErrors.push("Podaj poprawny adres email.");
    }

    if (formData.password.length < 6) {
      validationErrors.push("Hasło musi mieć co najmniej 6 znaków.");
    }

    if (formData.password !== formData.confirmPassword) {
      validationErrors.push("Hasła muszą być identyczne");
    }

    return validationErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setSuccessMessage("");

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors([data.error || "Błąd rejestracji"]);
        return;
      }

      setSuccessMessage("Rejestracja udana!");
    } catch (error) {
      setErrors(["Błąd połączenia z serwerem"]);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Rejestracja</h2>

        {successMessage && (
          <div className={`${styles.message} ${styles.success}`}>
            {successMessage}
          </div>
        )}

        {errors.length > 0 && (
          <div className={`${styles.message} ${styles.error}`}>
            <ul>
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles["form-group"]}>
            <label className={styles.label}>Nazwa użytkownika:</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="input"
            />
          </div>

          <div className={styles["form-group"]}>
            <label className={styles.label}>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input"
            />
          </div>

          <div className={styles["form-group"]}>
            <label className={styles.label}>Hasło:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input"
            />
          </div>

          <div className={styles["form-group"]}>
            <label className={styles.label}>Potwierdź hasło:</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="input"
            />
          </div>

          <button type="submit" className="button">
            Zarejestruj się
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
