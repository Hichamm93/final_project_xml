from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, Dict

class UserOut(BaseModel):
    id: int
    email: str
    role: str
    display_name: str

class AuthIn(BaseModel):
    email: str
    password: str

class AuthOut(BaseModel):
    token: str
    user: UserOut

class ClientRegisterIn(BaseModel):
    email: str
    password: str
    display_name: str

class CityOut(BaseModel):
    id: int
    name: str

class CinemaOut(BaseModel):
    id: int
    name: str
    address: str
    city: CityOut

class FilmOut(BaseModel):
    id: int
    title: str
    synopsis: str
    poster_url: Optional[str] = None
    backdrop_url: Optional[str] = None
    duration_min: int
    release_year: int
    genres: str
    language: str
    rating: str
    featured: bool

class ScreeningOut(BaseModel):
    id: int
    starts_at: datetime
    room: str
    price_cents: int
    total_seats: int
    booked_seats: int
    cinema: CinemaOut

class FilmDetailOut(BaseModel):
    film: FilmOut
    screenings_by_city: Dict[str, List[ScreeningOut]]

class FilmCreateIn(BaseModel):
    title: str
    synopsis: str
    poster_url: Optional[str] = None
    backdrop_url: Optional[str] = None
    duration_min: int = Field(ge=1)
    release_year: int
    genres: str
    language: str
    rating: str = "PG-13"
    featured: bool = False

class FilmUpdateIn(BaseModel):
    title: Optional[str] = None
    synopsis: Optional[str] = None
    poster_url: Optional[str] = None
    backdrop_url: Optional[str] = None
    duration_min: Optional[int] = None
    release_year: Optional[int] = None
    genres: Optional[str] = None
    language: Optional[str] = None
    rating: Optional[str] = None
    featured: Optional[bool] = None

class ScreeningCreateIn(BaseModel):
    cinema_id: int
    film_id: int
    starts_at: datetime
    room: str
    price_cents: int
    total_seats: int

class ScreeningUpdateIn(BaseModel):
    starts_at: Optional[datetime] = None
    room: Optional[str] = None
    price_cents: Optional[int] = None
    total_seats: Optional[int] = None

class ReservationCreateIn(BaseModel):
    screening_id: int
    seats: int = Field(ge=1)

class ReservationOut(BaseModel):
    id: int
    seats: int
    created_at: datetime
    screening: ScreeningOut
