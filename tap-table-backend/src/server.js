import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/db.js';
import mesasRoutes from './routes/mesasRoutes.js';
import productosRoutes from './routes/productosRoutes.js';
import comandasRoutes from './routes/comandasRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'Backend de Tap&Table funcionando correctamente',
  });
});

app.get('/api/test', (req, res) => {
  res.json({
    ok: true,
    message: 'Ruta de prueba funcionando',
  });
});

app.get('/api/db-test', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS test');
    res.json({
      ok: true,
      message: 'Conexión con MySQL correcta',
      result: rows,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: 'Error al conectar con MySQL',
      error: error.message,
    });
  }
});

app.use('/api/mesas', mesasRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/comandas', comandasRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});