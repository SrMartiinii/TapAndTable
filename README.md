# TapAndTable

TPV (Terminal Punto de Venta) para restaurantes. Gestiona mesas, comandas y carta desde una interfaz web, con visión en tiempo real de qué mesas están libres, ocupadas y cuánto llevan facturado.

## El problema

En un restaurante pequeño, la toma de comandas en papel o a voces entre sala y cocina genera errores frecuentes: platos que se pierden, mesas que se cobran mal, y ninguna visión centralizada de qué mesas están libres, ocupadas o cuánto llevan de cuenta en un momento dado.

## La propuesta

TapAndTable centraliza ese flujo en una sola interfaz: el camarero ve de un vistazo el estado de todas las mesas, abre una comanda por mesa y añade productos de la carta, el backend calcula el total en tiempo real manteniendo la relación mesa - comanda - detalle de lineas, y un panel de administracion da vision global de ventas, productos y mesas activas.

## Arquitectura

```
TapAndTable/
tap-table-backend    API REST - Express 5 + MySQL (mysql2)
tap-table-frontend   React 19 + Vite + React Router
```

Modelos principales: mesas, comandas, comanda_detalle, productos. La apertura de una comanda es transaccional: si una mesa no tiene comanda abierta, se crea una y se marca la mesa como ocupada en la misma transaccion.

## Stack

| Capa | Tecnologia |
| --- | --- |
| API REST | Express 5 |
| Base de datos | MySQL (mysql2) |
| Frontend | React 19 + Vite |
| Routing | React Router 7 |
| HTTP client | Axios |

## Paginas

- Login: pantalla de acceso (interfaz lista; ver limitaciones)
- Mesas: vista general del estado de las mesas
- Comanda: toma de pedidos por mesa
- Dashboard: ventas y metricas
- Admin: gestion de la carta
## Requisitos

- Node.js 18+
- MySQL 8+
## Instalacion

### Backend

```bash
cd tap-table-backend
npm install
cp .env.example .env
npm run dev
```

### Frontend

```bash
cd tap-table-frontend
npm install
npm run dev
```

## Variables de entorno

Copia tap-table-backend/.env.example a tap-table-backend/.env y configura PORT, DB_HOST, DB_PORT, DB_USER, DB_PASSWORD y DB_NAME.

## Limitaciones conocidas (honestidad)

- El login es una pantalla funcional en el frontend pero todavia no esta conectado a autenticacion real en el backend, no hay control de acceso por rol.
- No hay tests automatizados todavia.
- No se gestionan pagos ni facturacion real, solo el total acumulado por comanda.
## Contexto del autor

Proyecto personal para practicar desarrollo full stack con un caso de uso real de hosteleria: backend transaccional en Express/MySQL y frontend reactivo en React consumiendo esa API.

## Licencia

MIT
