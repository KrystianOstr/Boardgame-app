from urllib import response
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from models import db, User
import requests
import xml.etree.ElementTree as ET

app = Flask(__name__)
CORS(app)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///users.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)
bcrypt = Bcrypt(app)

with app.app_context():
    db.create_all()


@app.route("/search_game", methods=["GET"])
def search_game():
    first_game = request.args.get("name")
    if not first_game:
        return jsonify({"error": "No game name provided"}), 400

    game_id = first_game.get("id")

    search_url = (
        f"https://boardgamegeek.com/xmlapi2/search?query={first_game}&type=boardgame"
    )
    search_response = requests.get(search_url)

    if search_response.status_code != 200:
        return jsonify({"error": "Failed to fetch data from BoardGameGeek"}), 500

    search_root = ET.fromstring(search_response.content)

    return jsonify(
        {
            "id": game_id,
            "name": name,
            "image": thumbnail,
            "link": bgg_link,
            "max_players": max_players,
        }
    )


@app.route("/register", methods=["POST"])
def register():
    data = request.json
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not username or not email or not password:
        return jsonify({"error": "Wszystkie pola są wymagane!"}), 400

    existing_user_mail = User.query.filter_by(email=email).first()
    if existing_user_mail:
        return jsonify({"error": "Email jest już zajęty!"}), 400

    existing_username = User.query.filter_by(username=username).first()
    if existing_username:
        return jsonify({"error": "Nazwa użytkownika jest już zajęta!"}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")

    new_user = User(username=username, email=email, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()

    return (
        jsonify({"message": "Rejestracja udana!"}),
        201,
    )


if __name__ == "__main__":
    app.run(debug=True)
