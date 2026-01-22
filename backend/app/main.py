import os
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime

from .database import get_db, engine
from . import schemas
from .security import create_token, require_auth, require_role

app = FastAPI(title="LouLa Cinema API", version="1.0")

origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Helpers (SQL brut simple pour tenir la route vite) ---

def row_to_city(r): return {"id": r["id"], "name": r["name"]}
def row_to_cinema(r):
    return {
        "id": r["cinema_id"],
        "name": r["cinema_name"],
        "address": r["address"],
        "city": {"id": r["city_id"], "name": r["city_name"]},
    }

def row_to_film(r):
    return {
        "id": r["id"],
        "title": r["title"],
        "synopsis": r["synopsis"],
        "poster_url": r["poster_url"],
        "backdrop_url": r["backdrop_url"],
        "duration_min": r["duration_min"],
        "release_year": r["release_year"],
        "genres": r["genres"],
        "language": r["language"],
        "rating": r["rating"],
        "featured": r["featured"],
    }

def row_to_film_from_screening(r):
    return {
        "id": r["film_ref_id"],
        "title": r["film_title"],
        "synopsis": r["film_synopsis"],
        "poster_url": r["film_poster_url"],
        "backdrop_url": r["film_backdrop_url"],
        "duration_min": r["film_duration_min"],
        "release_year": r["film_release_year"],
        "genres": r["film_genres"],
        "language": r["film_language"],
        "rating": r["film_rating"],
        "featured": r["film_featured"],
    }

def row_to_screening(r):
    screening = {
        "id": r["id"],
        "starts_at": r["starts_at"],
        "room": r["room"],
        "price_cents": r["price_cents"],
        "total_seats": r["total_seats"],
        "booked_seats": r["booked_seats"],
        "cinema": row_to_cinema(r),
    }
    if "film_title" in r:
        screening["film"] = row_to_film_from_screening(r)
    return screening

def ensure_future_screening(starts_at: datetime):
    now = datetime.now(starts_at.tzinfo) if starts_at.tzinfo else datetime.now()
    if starts_at <= now:
        raise HTTPException(400, "La séance doit être programmée dans le futur.")

# --- Health ---
@app.get("/health")
def health(db: Session = Depends(get_db)):
    db.execute(text("SELECT 1"))
    return {"ok": True}

# --- Auth ---
@app.post("/auth/login", response_model=schemas.AuthOut)
def login(payload: schemas.AuthIn, db: Session = Depends(get_db)):
    q = text("SELECT id,email,password,role,display_name FROM users WHERE email=:email")
    r = db.execute(q, {"email": payload.email}).mappings().first()
    if not r or r["password"] != payload.password:
        raise HTTPException(401, "Bad credentials")
    token = create_token(r["id"], r["role"])
    return {"token": token, "user": {"id": r["id"], "email": r["email"], "role": r["role"], "display_name": r["display_name"]}}

@app.post("/auth/register-client", response_model=schemas.AuthOut)
def register_client(payload: schemas.ClientRegisterIn, db: Session = Depends(get_db)):
    exists = db.execute(text("SELECT 1 FROM users WHERE email=:e"), {"e": payload.email}).first()
    if exists:
        raise HTTPException(400, "Email already used")
    ins = text("INSERT INTO users(email,password,role,display_name) VALUES (:e,:p,'client',:n) RETURNING id,role")
    r = db.execute(ins, {"e": payload.email, "p": payload.password, "n": payload.display_name}).mappings().first()
    db.commit()
    token = create_token(r["id"], r["role"])
    return {"token": token, "user": {"id": r["id"], "email": payload.email, "role": r["role"], "display_name": payload.display_name}}

# --- Public: films ---
@app.get("/films/featured", response_model=list[schemas.FilmOut])
def featured(db: Session = Depends(get_db)):
    rows = db.execute(text("SELECT * FROM films WHERE featured=true ORDER BY created_at DESC LIMIT 20")).mappings().all()
    return [row_to_film(r) for r in rows]

@app.get("/films", response_model=list[schemas.FilmOut])
def list_films(q: str | None = None, db: Session = Depends(get_db)):
    if q:
        rows = db.execute(text("SELECT * FROM films WHERE lower(title) LIKE :q ORDER BY created_at DESC"),
                          {"q": f"%{q.lower()}%"}).mappings().all()
    else:
        rows = db.execute(text("SELECT * FROM films ORDER BY created_at DESC")).mappings().all()
    return [row_to_film(r) for r in rows]

@app.get("/films/{film_id}", response_model=schemas.FilmDetailOut)
def film_detail(film_id: int, db: Session = Depends(get_db)):
    film = db.execute(text("SELECT * FROM films WHERE id=:id"), {"id": film_id}).mappings().first()
    if not film:
        raise HTTPException(404, "Film not found")

    screenings = db.execute(text("""
      SELECT s.*, 
             ci.id as cinema_id, ci.name as cinema_name, ci.address,
             c.id as city_id, c.name as city_name
      FROM screenings s
      JOIN cinemas ci ON ci.id=s.cinema_id
      JOIN cities c ON c.id=ci.city_id
      WHERE s.film_id=:id AND s.starts_at > NOW()
      ORDER BY c.name, s.starts_at
    """), {"id": film_id}).mappings().all()

    by_city: dict[str, list] = {}
    for r in screenings:
        by_city.setdefault(r["city_name"], []).append(row_to_screening(r))

    return {"film": row_to_film(film), "screenings_by_city": by_city}

# --- Public: villes & programmations ---
@app.get("/cities", response_model=list[schemas.CityOut])
def cities(db: Session = Depends(get_db)):
    rows = db.execute(text("SELECT * FROM cities ORDER BY name")).mappings().all()
    return [row_to_city(r) for r in rows]

@app.get("/program", response_model=list[schemas.ScreeningOut])
def program(city: str | None = None, db: Session = Depends(get_db)):
    if city:
        rows = db.execute(text("""
          SELECT s.*,
                 ci.id as cinema_id, ci.name as cinema_name, ci.address,
                 c.id as city_id, c.name as city_name,
                 f.id as film_ref_id, f.title as film_title, f.synopsis as film_synopsis,
                 f.poster_url as film_poster_url, f.backdrop_url as film_backdrop_url,
                 f.duration_min as film_duration_min, f.release_year as film_release_year,
                 f.genres as film_genres, f.language as film_language,
                 f.rating as film_rating, f.featured as film_featured
          FROM screenings s
          JOIN films f ON f.id=s.film_id
          JOIN cinemas ci ON ci.id=s.cinema_id
          JOIN cities c ON c.id=ci.city_id
          WHERE lower(c.name)=:city AND s.starts_at > NOW()
          ORDER BY s.starts_at
        """), {"city": city.lower()}).mappings().all()
    else:
        rows = db.execute(text("""
          SELECT s.*,
                 ci.id as cinema_id, ci.name as cinema_name, ci.address,
                 c.id as city_id, c.name as city_name,
                 f.id as film_ref_id, f.title as film_title, f.synopsis as film_synopsis,
                 f.poster_url as film_poster_url, f.backdrop_url as film_backdrop_url,
                 f.duration_min as film_duration_min, f.release_year as film_release_year,
                 f.genres as film_genres, f.language as film_language,
                 f.rating as film_rating, f.featured as film_featured
          FROM screenings s
          JOIN films f ON f.id=s.film_id
          JOIN cinemas ci ON ci.id=s.cinema_id
          JOIN cities c ON c.id=ci.city_id
          WHERE s.starts_at > NOW()
          ORDER BY s.starts_at
        """)).mappings().all()
    return [row_to_screening(r) for r in rows]

# --- Client: réservations ---
@app.post("/reservations", response_model=schemas.ReservationOut)
def create_reservation(payload: schemas.ReservationCreateIn,
                       auth=Depends(require_role("client")),
                       db: Session = Depends(get_db)):
    s = db.execute(text("SELECT * FROM screenings WHERE id=:id"), {"id": payload.screening_id}).mappings().first()
    if not s:
        raise HTTPException(404, "Screening not found")
    remaining = s["total_seats"] - s["booked_seats"]
    if payload.seats > remaining:
        raise HTTPException(400, f"Not enough seats (remaining={remaining})")

    db.execute(text("UPDATE screenings SET booked_seats=booked_seats+:n WHERE id=:id"),
               {"n": payload.seats, "id": payload.screening_id})
    r = db.execute(text("""
      INSERT INTO reservations(user_id,screening_id,seats)
      VALUES (:u,:s,:n)
      RETURNING id,seats,created_at
    """), {"u": auth["user_id"], "s": payload.screening_id, "n": payload.seats}).mappings().first()
    db.commit()

    full = db.execute(text("""
      SELECT s.*,
             ci.id as cinema_id, ci.name as cinema_name, ci.address,
             c.id as city_id, c.name as city_name,
             f.id as film_ref_id, f.title as film_title, f.synopsis as film_synopsis,
             f.poster_url as film_poster_url, f.backdrop_url as film_backdrop_url,
             f.duration_min as film_duration_min, f.release_year as film_release_year,
             f.genres as film_genres, f.language as film_language,
             f.rating as film_rating, f.featured as film_featured
      FROM screenings s
      JOIN films f ON f.id=s.film_id
      JOIN cinemas ci ON ci.id=s.cinema_id
      JOIN cities c ON c.id=ci.city_id
      WHERE s.id=:id
    """), {"id": payload.screening_id}).mappings().first()

    return {"id": r["id"], "seats": r["seats"], "created_at": r["created_at"], "screening": row_to_screening(full)}

@app.get("/me/reservations", response_model=list[schemas.ReservationOut])
def my_reservations(auth=Depends(require_role("client")), db: Session = Depends(get_db)):
    rows = db.execute(text("""
      SELECT r.id as res_id, r.seats, r.created_at,
             s.*,
             ci.id as cinema_id, ci.name as cinema_name, ci.address,
             c.id as city_id, c.name as city_name,
             f.id as film_ref_id, f.title as film_title, f.synopsis as film_synopsis,
             f.poster_url as film_poster_url, f.backdrop_url as film_backdrop_url,
             f.duration_min as film_duration_min, f.release_year as film_release_year,
             f.genres as film_genres, f.language as film_language,
             f.rating as film_rating, f.featured as film_featured
      FROM reservations r
      JOIN screenings s ON s.id=r.screening_id
      JOIN films f ON f.id=s.film_id
      JOIN cinemas ci ON ci.id=s.cinema_id
      JOIN cities c ON c.id=ci.city_id
      WHERE r.user_id=:u AND s.starts_at > NOW()
      ORDER BY s.starts_at
    """), {"u": auth["user_id"]}).mappings().all()

    out = []
    for r in rows:
        screening = {k: r[k] for k in ["id","starts_at","room","price_cents","total_seats","booked_seats","cinema_id"]}
        # row_to_screening attend aussi champs cinema_*
        out.append({
            "id": r["res_id"],
            "seats": r["seats"],
            "created_at": r["created_at"],
            "screening": row_to_screening(r)
        })
    return out

# --- Proprio film: CRUD film + voir ses films programmés ---
@app.post("/owner/films", response_model=schemas.FilmOut)
def create_film(payload: schemas.FilmCreateIn, auth=Depends(require_role("proprio_film")), db: Session = Depends(get_db)):
    r = db.execute(text("""
      INSERT INTO films(owner_user_id,title,synopsis,poster_url,backdrop_url,duration_min,release_year,genres,language,rating,featured)
      VALUES (:u,:t,:s,:p,:b,:d,:y,:g,:l,:r,:f)
      RETURNING *
    """), {
        "u": auth["user_id"], "t": payload.title, "s": payload.synopsis,
        "p": payload.poster_url, "b": payload.backdrop_url,
        "d": payload.duration_min, "y": payload.release_year,
        "g": payload.genres, "l": payload.language, "r": payload.rating, "f": payload.featured
    }).mappings().first()
    db.commit()
    return row_to_film(r)

@app.get("/owner/films", response_model=list[schemas.FilmOut])
def my_films(auth=Depends(require_role("proprio_film")), db: Session = Depends(get_db)):
    rows = db.execute(text("SELECT * FROM films WHERE owner_user_id=:u ORDER BY created_at DESC"),
                      {"u": auth["user_id"]}).mappings().all()
    return [row_to_film(r) for r in rows]

@app.patch("/owner/films/{film_id}", response_model=schemas.FilmOut)
def update_film(film_id: int, payload: schemas.FilmUpdateIn,
                auth=Depends(require_role("proprio_film")), db: Session = Depends(get_db)):
    film = db.execute(text("SELECT * FROM films WHERE id=:id AND owner_user_id=:u"),
                      {"id": film_id, "u": auth["user_id"]}).mappings().first()
    if not film:
        raise HTTPException(404, "Film not found")

    fields = payload.model_dump(exclude_unset=True)
    if not fields:
        return row_to_film(film)

    sets = ", ".join([f"{k} = :{k}" for k in fields.keys()])
    fields.update({"id": film_id})
    r = db.execute(text(f"UPDATE films SET {sets} WHERE id=:id RETURNING *"), fields).mappings().first()
    db.commit()
    return row_to_film(r)

@app.delete("/owner/films/{film_id}")
def delete_film(film_id: int, auth=Depends(require_role("proprio_film")), db: Session = Depends(get_db)):
    # ON DELETE CASCADE : screenings + reservations suivent
    ok = db.execute(text("DELETE FROM films WHERE id=:id AND owner_user_id=:u"),
                    {"id": film_id, "u": auth["user_id"]}).rowcount
    db.commit()
    if not ok:
        raise HTTPException(404, "Film not found")
    return {"deleted": True}

@app.get("/owner/films/programmed", response_model=list[schemas.ScreeningOut])
def my_films_programmed(auth=Depends(require_role("proprio_film")), db: Session = Depends(get_db)):
    rows = db.execute(text("""
      SELECT s.*,
             ci.id as cinema_id, ci.name as cinema_name, ci.address,
             c.id as city_id, c.name as city_name,
             f.id as film_ref_id, f.title as film_title, f.synopsis as film_synopsis,
             f.poster_url as film_poster_url, f.backdrop_url as film_backdrop_url,
             f.duration_min as film_duration_min, f.release_year as film_release_year,
             f.genres as film_genres, f.language as film_language,
             f.rating as film_rating, f.featured as film_featured
      FROM screenings s
      JOIN films f ON f.id=s.film_id
      JOIN cinemas ci ON ci.id=s.cinema_id
      JOIN cities c ON c.id=ci.city_id
      WHERE f.owner_user_id=:u
      ORDER BY s.starts_at DESC
    """), {"u": auth["user_id"]}).mappings().all()
    return [row_to_screening(r) for r in rows]

# --- Proprio cinema: programmer / modifier / supprimer screening ---
@app.get("/cinema/mine")
def my_cinemas(auth=Depends(require_role("proprio_cinema")), db: Session = Depends(get_db)):
    rows = db.execute(text("""
      SELECT ci.id, ci.name, ci.address, c.id as city_id, c.name as city_name
      FROM cinemas ci JOIN cities c ON c.id=ci.city_id
      WHERE ci.owner_user_id=:u
      ORDER BY ci.name
    """), {"u": auth["user_id"]}).mappings().all()
    return [{"id": r["id"], "name": r["name"], "address": r["address"], "city": {"id": r["city_id"], "name": r["city_name"]}} for r in rows]

@app.get("/cinema/screenings", response_model=list[schemas.ScreeningOut])
def my_cinema_screenings(auth=Depends(require_role("proprio_cinema")), db: Session = Depends(get_db)):
    rows = db.execute(text("""
      SELECT s.*,
             ci.id as cinema_id, ci.name as cinema_name, ci.address,
             c.id as city_id, c.name as city_name,
             f.id as film_ref_id, f.title as film_title, f.synopsis as film_synopsis,
             f.poster_url as film_poster_url, f.backdrop_url as film_backdrop_url,
             f.duration_min as film_duration_min, f.release_year as film_release_year,
             f.genres as film_genres, f.language as film_language,
             f.rating as film_rating, f.featured as film_featured
      FROM screenings s
      JOIN cinemas ci ON ci.id=s.cinema_id
      JOIN cities c ON c.id=ci.city_id
      JOIN films f ON f.id=s.film_id
      WHERE ci.owner_user_id=:u AND s.starts_at > NOW()
      ORDER BY s.starts_at
    """), {"u": auth["user_id"]}).mappings().all()
    return [row_to_screening(r) for r in rows]

@app.post("/cinema/screenings", response_model=schemas.ScreeningOut)
def create_screening(payload: schemas.ScreeningCreateIn,
                     auth=Depends(require_role("proprio_cinema")),
                     db: Session = Depends(get_db)):
    owns = db.execute(text("SELECT 1 FROM cinemas WHERE id=:id AND owner_user_id=:u"),
                      {"id": payload.cinema_id, "u": auth["user_id"]}).first()
    if not owns:
        raise HTTPException(403, "Not your cinema")
    ensure_future_screening(payload.starts_at)

    r = db.execute(text("""
      INSERT INTO screenings(cinema_id,film_id,starts_at,room,price_cents,total_seats)
      VALUES (:ci,:f,:st,:room,:p,:ts)
      RETURNING id
    """), {
        "ci": payload.cinema_id, "f": payload.film_id, "st": payload.starts_at,
        "room": payload.room, "p": payload.price_cents, "ts": payload.total_seats
    }).mappings().first()
    db.commit()

    full = db.execute(text("""
      SELECT s.*,
             ci.id as cinema_id, ci.name as cinema_name, ci.address,
             c.id as city_id, c.name as city_name
      FROM screenings s
      JOIN cinemas ci ON ci.id=s.cinema_id
      JOIN cities c ON c.id=ci.city_id
      WHERE s.id=:id
    """), {"id": r["id"]}).mappings().first()
    return row_to_screening(full)

@app.patch("/cinema/screenings/{screening_id}", response_model=schemas.ScreeningOut)
def update_screening(screening_id: int, payload: schemas.ScreeningUpdateIn,
                     auth=Depends(require_role("proprio_cinema")),
                     db: Session = Depends(get_db)):
    owns = db.execute(text("""
      SELECT 1 FROM screenings s
      JOIN cinemas ci ON ci.id=s.cinema_id
      WHERE s.id=:sid AND ci.owner_user_id=:u
    """), {"sid": screening_id, "u": auth["user_id"]}).first()
    if not owns:
        raise HTTPException(403, "Not your screening")

    fields = payload.model_dump(exclude_unset=True)
    if not fields:
        raise HTTPException(400, "No fields")
    if "starts_at" in fields:
        ensure_future_screening(fields["starts_at"])
    sets = ", ".join([f"{k} = :{k}" for k in fields.keys()])
    fields.update({"id": screening_id})
    db.execute(text(f"UPDATE screenings SET {sets} WHERE id=:id"), fields)
    db.commit()

    full = db.execute(text("""
      SELECT s.*,
             ci.id as cinema_id, ci.name as cinema_name, ci.address,
             c.id as city_id, c.name as city_name
      FROM screenings s
      JOIN cinemas ci ON ci.id=s.cinema_id
      JOIN cities c ON c.id=ci.city_id
      WHERE s.id=:id
    """), {"id": screening_id}).mappings().first()
    return row_to_screening(full)

@app.delete("/cinema/screenings/{screening_id}")
def delete_screening(screening_id: int, auth=Depends(require_role("proprio_cinema")), db: Session = Depends(get_db)):
    ok = db.execute(text("""
      DELETE FROM screenings s
      USING cinemas ci
      WHERE s.cinema_id=ci.id AND s.id=:sid AND ci.owner_user_id=:u
    """), {"sid": screening_id, "u": auth["user_id"]}).rowcount
    db.commit()
    if not ok:
        raise HTTPException(404, "Screening not found")
    return {"deleted": True}
