# TapAndTable

TPV (Terminal Punto de Venta) para restaurantes. Permite gestionar mesas, pedidos y la carta desde una interfaz web.

## Estructura

```
TapAndTable/
├── tap-table-backend/   # API REST con Express + MySQL
└── tap-table-frontend/  # Cliente web con React 19 + Vite
```

## Requisitos

- Node.js 18+
- MySQL 8+

## Instalación

### Backend

```bash
cd tap-table-backend
npm install
cp .env.example .env   # Rellena con tus credenciales
npm run dev
```

### Frontend

```bash
cd tap-table-frontend
npm install
npm run dev
```

## Variables de entorno

Copia `tap-table-backend/.env.example` a `tap-table-backend/.env` y configura:

| Variable    | Descripción                  |
|-------------|------------------------------|
| PORT        | Puerto del servidor (3001)   |
| DB_HOST     | Host de la base de datos     |
| DB_PORT     | Puerto de MySQL              |
| DB_USER     | Usuario de MySQL             |
| DB_PASSWORD | Contraseña de MySQL          |
| DB_NAME     | Nombre de la base de datos   |
