import { useEffect, useState } from "react";
import styles from "../components/GameTables.module.css";
import { useNavigate } from "react-router-dom";

const GameTables = () => {
  const [tables, setTables] = useState([]);
  const [tableToDelete, setTableToDelete] = useState(null);
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/tables`)
      .then((response) => response.json())
      .then((data) => {
        console.log("Dane pobrane: ", data);
        setTables(data);
      })
      .catch((error) => console.error("Błąd pobierania stołów:", error));
  }, []);

  const handleAddGame = () => {
    if (token) {
      navigate("/add-game");
    } else {
      navigate("/login");
    }
  };

  const handleJoin = async (tableId, maxPlayers, currentPlayers) => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (currentPlayers >= maxPlayers) {
      alert("Nie możesz dołączyć, osiągnięto maksymalną liczbę graczy!");
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/tables/${tableId}/join`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Błąd podczas dołączania.");
        return;
      }

      fetch(`${import.meta.env.VITE_BACKEND_URL}/tables`)
        .then((response) => response.json())
        .then((data) => setTables(data))
        .catch((error) => console.error("Błąd pobierania stołów:", error));
    } catch {
      alert("Błąd połączenia z serwerem.");
    }
  };

  const handleLeave = async (tableId) => {
    if (!token) {
      alert("Musisz być zalogowany!");
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/tables/${tableId}/leave`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Błąd opuszczania stołu.");
        return;
      }

      setTables(
        tables.map((table) =>
          table.id === tableId
            ? { ...table, joined_users: data.joined_users.split(",") }
            : table
        )
      );
    } catch {
      alert("Błąd połączenia z serwerem.");
    }
  };

  const confirmDelete = (tableId) => {
    setTableToDelete(tableId);
  };

  const handleDelete = async () => {
    if (!tableToDelete) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/tables/${tableToDelete}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        alert("Błąd podczas usuwania stołu.");
        return;
      }

      setTables((prevTables) =>
        prevTables.filter((table) => table.id !== tableToDelete)
      );
      setTableToDelete(null);
    } catch {
      alert("Błąd połączenia z serwerem.");
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Dostępne stoły do gry</h2>
      <button onClick={handleAddGame} className={styles.addGameButton}>
        Dodaj grę
      </button>
      {tables.length === 0 ? (
        <p className={styles.noTables}>Brak dostępnych stołów.</p>
      ) : (
        <div className={styles.tablesList}>
          {tables.map((table) => {
            const maxPlayers = parseInt(table.players.split(" - ")[1]);
            const currentPlayers = table.joined_users.length;

            return (
              <div key={table.id} className={styles.tableCard}>
                <h3 className={styles.gameTitle}>{table.name}</h3>

                {table.host === username && (
                  <button
                    onClick={() => confirmDelete(table.id)}
                    className={styles.deleteButton}
                  >
                    Usuń stół
                  </button>
                )}

                {tableToDelete === table.id && (
                  <div className={styles.confirmationBox}>
                    <p>Czy na pewno chcesz usunąć ten stół?</p>
                    <div className={styles.confirmationButtons}>
                      <button
                        onClick={handleDelete}
                        className={styles.confirmButton}
                      >
                        Tak
                      </button>
                      <button
                        onClick={() => setTableToDelete(null)}
                        className={styles.cancelButton}
                      >
                        Anuluj
                      </button>
                    </div>
                  </div>
                )}

                <p>
                  <strong>Założyciel:</strong> {table.host}
                </p>

                {table.image_url && (
                  <img
                    src={table.image_url}
                    alt={table.name}
                    className={styles.gameImage}
                  />
                )}

                <p>
                  <strong>Liczba graczy:</strong> {table.players}
                </p>
                <p>
                  <strong>Czas gry:</strong> {table.game_time}
                </p>
                <p>
                  <a
                    href={table.bgg_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.bggLink}
                  >
                    Link do gry na BGG
                  </a>
                </p>
                <p>
                  <strong>Uwagi:</strong> {table.comment}
                </p>

                <p>
                  <strong>Gracze:</strong>
                </p>
                <ul>
                  {table.joined_users.length > 0 ? (
                    table.joined_users.map((user, index) => (
                      <li key={index}>{`Gracz ${index + 1}: ${user}`}</li>
                    ))
                  ) : (
                    <li>Brak graczy</li>
                  )}
                </ul>

                <div className={styles.buttonContainer}>
                  {!table.joined_users.includes(username) && (
                    <button
                      onClick={() =>
                        handleJoin(table.id, maxPlayers, currentPlayers)
                      }
                      className={styles.joinButton}
                      disabled={currentPlayers >= maxPlayers}
                    >
                      {currentPlayers >= maxPlayers ? "Brak miejsc" : "Dołącz"}
                    </button>
                  )}

                  {table.joined_users.includes(username) &&
                    table.host !== username && (
                      <button
                        onClick={() => handleLeave(table.id)}
                        className={styles.leaveButton}
                      >
                        Opuść
                      </button>
                    )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GameTables;
