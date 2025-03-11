from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin

db = SQLAlchemy()


class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(60), nullable=False)


class GameTable(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    players = db.Column(db.String(20), nullable=False)
    game_time = db.Column(db.String(20), nullable=True)
    bgg_link = db.Column(db.String(255), nullable=True)
    image_url = db.Column(db.String(255), nullable=True)
    comment = db.Column(db.Text, nullable=True)
    host = db.Column(db.String(100), nullable=False)  # 🔥 Założyciel
    joined_users = db.Column(
        db.Text, nullable=True
    )  # 🔥 Lista graczy w formacie: "user1,user2"
