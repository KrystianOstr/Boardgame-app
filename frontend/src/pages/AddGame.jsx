import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../components/AddGame.module.css";
import "../global.css";

const AddGame = () => {
  const [search, setSearch] = useState(""); // Pole wyszukiwania
  const [games, setGames] = useState([]); // Wyniki wyszukiwania
  const [formData, setFormData] = useState({
    name: "",
    comment: "",
    players: "",
    bgg_link: "",
    image_url: "",
    game_time: "",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login"); // Przekierowanie na stronę logowania
    }
  }, []);

  // Obsługa wyszukiwania gier
  const handleSearch = async (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);

    if (value.length < 3) {
      setGames([]); // Nie wysyłamy zapytania jeśli wpisano mniej niż 3 znaki
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/search_game?name=${value}`
      );
      const data = await response.json();

      // Filtrowanie wyników - sprawdzamy, czy tytuł zawiera wpisany fragment
      const filteredGames = data.filter((game) =>
        game.name.toLowerCase().includes(value)
      );

      setGames(filteredGames);
    } catch (error) {
      console.error("Błąd wyszukiwania:", error);
    }
  };

  // Pobieranie szczegółów gry po wyborze
  const handleSelectGame = async (game) => {
    setFormData({
      ...formData,
      name: game.name,
      comment: "",
      players: "Ładowanie...",
      game_time: "Ładowanie...",
      bgg_link: `https://boardgamegeek.com/boardgame/${game.id}`,
      image_url: "",
    });

    try {
      const response = await fetch(
        `https://boardgamegeek.com/xmlapi2/thing?id=${game.id}`
      );
      const text = await response.text();

      // Parsowanie XML
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, "text/xml");

      // Pobieranie liczby graczy
      const minPlayers =
        xmlDoc.querySelector("minplayers")?.getAttribute("value") || "?";
      const maxPlayers =
        xmlDoc.querySelector("maxplayers")?.getAttribute("value") || "?";
      const playersRange = `${minPlayers} - ${maxPlayers}`;

      // Pobieranie czasu gry
      const gameTime =
        xmlDoc.querySelector("playingtime")?.getAttribute("value") ||
        "Brak danych";

      // Pobieranie obrazka
      const image = xmlDoc.querySelector("thumbnail")?.textContent || "";

      // Aktualizacja danych
      setFormData((prevFormData) => ({
        ...prevFormData,
        players: playersRange,
        game_time: `${gameTime} min`,
        image_url: image,
      }));
    } catch (error) {
      console.error("Błąd pobierania danych gry:", error);
      setFormData((prevFormData) => ({
        ...prevFormData,
        players: "Błąd pobierania",
        game_time: "Błąd pobierania",
      }));
    }

    setGames([]); // Ukrywamy listę wyników po wyborze gry
  };

  // Wysyłanie gry do bazy danych
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔥 Sprawdzenie, czy wszystkie wymagane pola są uzupełnione
    if (
      !formData.name ||
      !formData.players ||
      !formData.game_time ||
      !formData.bgg_link
    ) {
      setError("Wszystkie pola muszą być uzupełnione!");
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/tables`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Błąd podczas dodawania gry.");
        return;
      }

      navigate("/tables"); // 🔥 Przekierowanie na listę gier po dodaniu
    } catch {
      setError("Błąd połączenia z serwerem.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Dodaj nową grę</h2>
        {error && (
          <p className={`${styles.message} ${styles.error}`}>{error}</p>
        )}

        <div className={styles.form}>
          {/* WYSZUKIWARKA */}
          <div className={styles.formGroup}>
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              className={styles.input}
              placeholder="Wyszukaj grę..."
            />
          </div>

          {/* LISTA WYNIKÓW */}
          {games.length > 0 && (
            <ul className={styles.searchResults}>
              {games.map((game) => (
                <li
                  key={game.id}
                  onClick={() => handleSelectGame(game)}
                  className={styles.resultItem}
                >
                  {game.name}
                </li>
              ))}
            </ul>
          )}

          {/* OBRAZEK GRY */}
          {formData.image_url && (
            <img
              src={formData.image_url}
              alt="Okładka gry"
              className={styles.gameImage}
            />
          )}

          {/* FORMULARZ */}
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Nazwa gry:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                readOnly
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Liczba graczy:</label>
              <input
                type="text"
                name="players"
                value={formData.players}
                readOnly
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Czas gry:</label>
              <input
                type="text"
                name="game_time"
                value={formData.game_time}
                readOnly
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Link do BGG:</label>
              {formData.bgg_link && (
                <a
                  href={formData.bgg_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.bggLink}
                >
                  {formData.bgg_link}
                </a>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Komentarz hosta:</label>
              <textarea
                name="comment"
                value={formData.comment}
                onChange={(e) =>
                  setFormData({ ...formData, comment: e.target.value })
                }
                className={styles.textarea}
              ></textarea>
            </div>

            <button type="submit" className={styles.button}>
              Dodaj grę
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddGame;
