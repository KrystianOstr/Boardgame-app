from app import app, db, GameTable

# Tworzymy kontekst aplikacji Flask
with app.app_context():
    # Sprawdzamy, czy baza danych jest pusta
    if GameTable.query.first() is None:
        new_table1 = GameTable(
            name="Catan",
            description="Klasyczna gra strategiczna.",
            image_url="https://cf.geekdo-images.com/PyUol9QxBnZQCJqZI6bmSA__imagepage/img/tDdC3V3b26mJyPSyQI-_e2_E3Ik=/fit-in/900x600/filters:no_upscale():strip_icc()/pic8632666.png",
        )
        new_table2 = GameTable(
            name="Dixit",
            description="Kreatywna gra skojarzeń.",
            image_url="https://example.com/dixit.jpg",
        )

        # Dodajemy stoły do bazy danych
        db.session.add(new_table1)
        db.session.add(new_table2)
        db.session.commit()

        print("✅ Dodano przykładowe stoły do bazy!")
    else:
        print("ℹ️ Baza danych już zawiera stoły, pomijam dodawanie.")
