import pool from '../config/db.js';

export const getDashboardResumen = async (req, res) => {
  try {
    const [[mesasLibresRow]] = await pool.query(`
      SELECT COUNT(*) AS total
      FROM mesas
      WHERE estado = 'libre'
    `);

    const [[mesasOcupadasRow]] = await pool.query(`
      SELECT COUNT(*) AS total
      FROM mesas
      WHERE estado IN ('ocupada', 'servida')
    `);

    const [[pendientesCobroRow]] = await pool.query(`
      SELECT COUNT(*) AS total
      FROM mesas
      WHERE estado = 'pendiente'
    `);

    const [[ventasDiaRow]] = await pool.query(`
      SELECT COALESCE(SUM(total), 0) AS total
      FROM comandas
      WHERE estado = 'cobrada'
        AND DATE(fecha_cierre) = CURDATE()
    `);

    const [mesasRecientes] = await pool.query(`
      SELECT
        m.id,
        m.numero,
        m.estado,
        COALESCE(c.total, 0) AS total
      FROM mesas m
      LEFT JOIN comandas c
        ON c.mesa_id = m.id
        AND c.estado = 'abierta'
      ORDER BY m.numero ASC
      LIMIT 4
    `);

    res.json({
      ok: true,
      resumen: {
        mesasLibres: mesasLibresRow.total,
        mesasOcupadas: mesasOcupadasRow.total,
        pendientesCobro: pendientesCobroRow.total,
        ventasDia: Number(ventasDiaRow.total),
      },
      mesasRecientes,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: 'Error al obtener el dashboard',
      error: error.message,
    });
  }
};