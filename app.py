from flask import Flask, Response, request, jsonify
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from models import db, User, GameTable
import xml.etree.ElementTree as ET
import requests
from auth import verify_token
from dotenv import load_dotenv
from datetime import datetime, timedelta
import jwt
import os


load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY", "tajny_klucz")

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# Konfiguracja bazy danych
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///users.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)
bcrypt = Bcrypt(app)

# Tworzymy bazę danych, jeśli nie istnieje
with app.app_context():
    db.create_all()


@app.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()
    if not user or not bcrypt.check_password_hash(user.password, password):
        return jsonify({"error": "Nieprawidłowy email lub hasło."}), 401

    # Generowanie tokena JWT
    payload = {
        "username": user.username,  # 🔥 Teraz zwracamy username w tokenie
        "exp": datetime.utcnow() + timedelta(hours=12),
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")

    return jsonify(
        {"message": "Logowanie udane!", "token": token, "username": user.username}
    )


@app.route("/search_game", methods=["GET"])
def search_game():
    game_name = request.args.get("name")
    if not game_name:
        return jsonify({"error": "Nie podano nazwy gry"}), 400  # 400 Bad Request

    url = f"https://boardgamegeek.com/xmlapi/search?search={game_name}"
    response = requests.get(
        url
    )  # ✅ Poprawione: używamy `requests.get()`, a nie `request.get()`

    if response.status_code != 200:
        return (
            jsonify({"error": "Nie udało się pobrać danych z BGG"}),
            500,
        )  # 500 Internal Server Error

    root = ET.fromstring(response.content)
    results = []

    for item in root.findall("boardgame"):
        game_id = item.get("objectid")
        game_title = (
            item.find("name").text if item.find("name") is not None else "Brak nazwy"
        )

        results.append({"id": game_id, "name": game_title})

    return jsonify(results), 200  # 200 OK


@app.route("/tables", methods=["GET"])
def get_tables():
    tables = GameTable.query.all()
    return jsonify(
        [
            {
                "id": table.id,
                "name": table.name,
                "players": table.players,
                "game_time": table.game_time,
                "bgg_link": table.bgg_link,
                "image_url": table.image_url,
                "comment": table.comment,
                "host": table.host,
                "joined_users": (
                    table.joined_users.split(",") if table.joined_users else []
                ),
            }
            for table in tables
        ]
    )


@app.route("/tables", methods=["POST"])
def add_table():
    user = verify_token()
    if not user:
        return jsonify({"error": "Brak autoryzacji"}), 401

    data = request.json
    host_username = user["username"]

    new_table = GameTable(
        name=data.get("name"),
        players=data.get("players"),
        game_time=data.get("game_time"),
        bgg_link=data.get("bgg_link"),
        image_url=data.get("image_url"),
        comment=data.get("comment"),
        host=host_username,
        joined_users=host_username,  # 🔥 Host jest pierwszym graczem
    )

    db.session.add(new_table)
    db.session.commit()

    return jsonify({"message": "Gra została dodana!", "table": data}), 201


@app.route("/tables/<int:table_id>/join", methods=["POST"])
def join_table(table_id):
    user = verify_token()
    if not user:
        return jsonify({"error": "Brak autoryzacji"}), 401

    table = GameTable.query.get(table_id)
    if not table:
        return jsonify({"error": "Nie znaleziono stołu"}), 404

    username = user["username"]

    # Sprawdzamy, czy użytkownik już dołączył
    joined_users = table.joined_users.split(",") if table.joined_users else []
    if username in joined_users:
        return jsonify({"error": "Jesteś już w tej grze!"}), 400

    # Dodajemy użytkownika do listy graczy
    joined_users.append(username)
    table.joined_users = ",".join(joined_users)
    db.session.commit()

    print(
        f"Zaktualizowana lista graczy dla stołu {table_id}: {table.joined_users}"
    )  # 🔥 Debugging

    return (
        jsonify({"message": "Dołączono do gry!", "joined_users": table.joined_users}),
        200,
    )


@app.route("/tables/<int:table_id>", methods=["DELETE"])
def delete_table(table_id):
    user = verify_token()
    if not user:
        return jsonify({"error": "Brak autoryzacji"}), 401

    table = GameTable.query.get(table_id)
    if not table:
        return jsonify({"error": "Stół nie istnieje"}), 404

    # Sprawdzamy, czy użytkownik to właściciel stołu
    if table.host != user["username"]:
        return jsonify({"error": "Nie masz uprawnień do usunięcia tego stołu"}), 403

    db.session.delete(table)
    db.session.commit()

    return jsonify({"message": "Stół został usunięty"}), 200


@app.route("/tables/<int:table_id>/leave", methods=["DELETE"])
def leave_table(table_id):
    user = verify_token()
    if not user:
        return jsonify({"error": "Brak autoryzacji"}), 401

    table = GameTable.query.get(table_id)
    if not table:
        return jsonify({"error": "Stół nie istnieje"}), 404

    username = user["username"]

    # Sprawdzamy, czy użytkownik w ogóle jest w tym stole
    joined_users = table.joined_users.split(",") if table.joined_users else []
    if username not in joined_users:
        return jsonify({"error": "Nie jesteś w tym stole!"}), 400

    # Usuwamy użytkownika z listy
    joined_users.remove(username)
    table.joined_users = ",".join(joined_users)
    db.session.commit()

    return (
        jsonify({"message": "Opuszczono stół", "joined_users": table.joined_users}),
        200,
    )


# 📌 3️⃣ Endpoint rejestracji użytkownika
@app.route("/register", methods=["POST"])
def register():
    try:
        data = request.json
        username = data.get("username")
        email = data.get("email")
        password = data.get("password")

        if not username or not email or not password:
            return jsonify({"error": "Wszystkie pola są wymagane!"}), 400

        # Sprawdzamy, czy użytkownik już istnieje
        if User.query.filter_by(email=email).first():
            return jsonify({"error": "Email jest już zajęty!"}), 400

        if User.query.filter_by(username=username).first():
            return jsonify({"error": "Nazwa użytkownika jest już zajęta!"}), 400

        hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")

        new_user = User(username=username, email=email, password=hashed_password)
        db.session.add(new_user)
        db.session.commit()

        return jsonify({"message": "Rejestracja udana!"}), 201  # 201 Created

    except Exception as e:
        return jsonify({"error": f"Błąd rejestracji: {str(e)}"}), 500


# 📌 Uruchomienie aplikacji
if __name__ == "__main__":
    app.run(debug=True)

print("Lista dostępnych tras:")
for rule in app.url_map.iter_rules():
    print(rule)
