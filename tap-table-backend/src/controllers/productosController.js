import pool from '../config/db.js';

export const getProductos = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.id,
        p.nombre,
        p.precio,
        c.nombre AS categoria,
        p.activo
      FROM productos p
      INNER JOIN categorias c ON p.categoria_id = c.id
      WHERE p.activo = TRUE
      ORDER BY c.nombre ASC, p.nombre ASC
    `);

    res.json({
      ok: true,
      productos: rows,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: 'Error al obtener los productos',
      error: error.message,
    });
  }
};