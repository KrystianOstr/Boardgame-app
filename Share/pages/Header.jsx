import styles from "../components/Header.module.css";
import "../global.css";

const Header = () => {
  return (
    <div className={styles.header}>
      <img
        src="/public/logo-podwawelskie.jpeg"
        alt="Podwawelskie planszówki logo"
        className={styles.logo}
      />
      <h1 className={styles.title}>PODWAWELSKIE PLANSZÓWKI</h1>
    </div>
  );
};

export default Header;
