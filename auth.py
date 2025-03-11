import jwt
import os
from flask import request, jsonify
from dotenv import load_dotenv

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY", "tajny_klucz")


def verify_token():
    token = request.headers.get("Authorization")
    if not token:
        print("Brak tokena w nagłówku!")  # 🔥 Debugging
        return None

    try:
        token = token.replace("Bearer ", "")  # 🔥 Usuwamy "Bearer " jeśli jest
        decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        print("Zdekodowany token:", decoded)  # 🔥 Debugging
        return {"username": decoded["username"]}
    except jwt.ExpiredSignatureError:
        print("Token wygasł!")  # 🔥 Debugging
        return None
    except jwt.InvalidTokenError:
        print("Nieprawidłowy token!")  # 🔥 Debugging
        return None
