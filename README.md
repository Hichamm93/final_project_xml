# LouLa Cinema — Projet REST (FastAPI + PostgreSQL + React/Vite)

Application web type “Netflix-like” pour la **découverte**, la **programmation** et la **réservation** de films, avec 3 rôles :
- **Client** : consulter les films / séances, réserver, voir ses réservations
- **Proprio film** : ajouter / modifier / supprimer ses films
- **Proprio cinéma** : programmer des films dans son cinéma, modifier / supprimer des programmations

Stack :
- **Backend** : FastAPI (REST) + Swagger
- **DB** : PostgreSQL (Docker)
- **Frontend** : React + Vite + TailwindCSS (Docker)

---

## Prérequis

- **Docker Desktop** installé et démarré
- (Optionnel) VS Code + extension Tailwind IntelliSense

> Aucun `venv` ni `npm install` n’est nécessaire si vous lancez via Docker Compose.

---

## Démarrage rapide (Docker)

Depuis la racine du projet :

```bash
docker compose up --build



# TODO

# Avoir une Bonne database              
# Le problème des programmations