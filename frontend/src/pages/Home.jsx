import { Link } from "react-router-dom";
import styles from "../components/Home.module.css"; // Import CSS Modules
console.log("✅ Home component załadowany!");

const Home = () => {
  console.log("Styles in Home.jsx:", styles);
  console.log("✅ Home component załadowany!");

  return (
    <div className={styles.container}>
      <div className={styles.contentbox}>
        <h1 className={styles.title}>Witaj w Aplikacji Planszówkowej!</h1>
        <p className={styles.text}>
          Jesteś pasjonatem gier planszowych i szukasz kompanów do wspólnej
          zabawy? Dobrze trafiłeś! Nasza aplikacja to idealne miejsce dla
          miłośników planszówek. Umawiaj się na emocjonujące rozgrywki, poznawaj
          nowych graczy i ciesz się każdą chwilą przy stole!
        </p>
        <p className={styles.text}>
          Aplikacja została stworzona z myślą o społeczności Podwawelskie
          Planszówki. Naszym celem jest stworzenie przestrzeni, w której każdy
          miłośnik gier planszowych będzie mógł znaleźć graczy do wspólnej
          zabawy.
        </p>
        <p className={styles.text}>
          Już nigdy więcej uciążliwego wypełniania excela! Nasza aplikacja
          sprawia, że organizowanie spotkań planszówkowych jest łatwiejsze i
          przyjemniejsze niż kiedykolwiek wcześniej.
        </p>

        <p className={styles.text}>
          Aby dołączyć do zabawy lub stworzyć własny stół, zarejestruj się lub
          zaloguj.
        </p>

        <div className={styles.authlinks}>
          <Link to={"/add-game"} className={styles.link}>
            Dodaj gre
          </Link>
          <Link to={"/tables"} className={styles.link}>
            Lista gier
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
