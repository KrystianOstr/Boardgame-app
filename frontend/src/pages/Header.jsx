import { useNavigate } from "react-router-dom";
import styles from "../components/Header.module.css";

const Header = () => {
  const navigate = useNavigate(); // Hook do nawigacji

  return (
    <div className={styles.header} onClick={() => navigate("/")}>
      <img
        src="/logo-podwawelskie.jpeg"
        alt="Podwawelskie planszówki logo"
        className={styles.logo}
      />
      <h1 className={styles.title}>PODWAWELSKIE PLANSZÓWKI</h1>
    </div>
  );
};

export default Header;
