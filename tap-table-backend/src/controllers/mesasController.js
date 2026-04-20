import pool from '../config/db.js';

export const getMesas = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        m.id,
        m.numero,
        m.capacidad,
        m.estado,
        c.id AS comanda_id,
        COALESCE(c.total, 0) AS total,
        c.estado AS comanda_estado
      FROM mesas m
      LEFT JOIN comandas c
        ON c.mesa_id = m.id
        AND c.estado = 'abierta'
      ORDER BY m.numero ASC
    `);

    res.json({
      ok: true,
      mesas: rows,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: 'Error al obtener las mesas',
      error: error.message,
    });
  }
};