import pool from '../config/db.js';

export const getComandaByMesa = async (req, res) => {
  const { mesaId } = req.params;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [comandas] = await connection.query(
      `
      SELECT id, mesa_id, estado, total, fecha_apertura
      FROM comandas
      WHERE mesa_id = ? AND estado = 'abierta'
      LIMIT 1
      `,
      [mesaId]
    );

    let comanda;

    if (comandas.length === 0) {
      const [result] = await connection.query(
        `
        INSERT INTO comandas (mesa_id, estado, total)
        VALUES (?, 'abierta', 0.00)
        `,
        [mesaId]
      );

      const [nuevaComanda] = await connection.query(
        `
        SELECT id, mesa_id, estado, total, fecha_apertura
        FROM comandas
        WHERE id = ?
        `,
        [result.insertId]
      );

      comanda = nuevaComanda[0];

      await connection.query(
        `
        UPDATE mesas
        SET estado = 'ocupada'
        WHERE id = ? AND estado = 'libre'
        `,
        [mesaId]
      );
    } else {
      comanda = comandas[0];
    }

    const [detalle] = await connection.query(
      `
      SELECT
        cd.id,
        cd.producto_id,
        p.nombre,
        cd.cantidad,
        cd.precio_unitario,
        (cd.cantidad * cd.precio_unitario) AS subtotal
      FROM comanda_detalle cd
      INNER JOIN productos p ON cd.producto_id = p.id
      WHERE cd.comanda_id = ?
      ORDER BY cd.id ASC
      `,
      [comanda.id]
    );

    await connection.commit();

    res.json({
      ok: true,
      comanda,
      detalle,
    });
  } catch (error) {
    await connection.rollback();

    res.status(500).json({
      ok: false,
      message: 'Error al obtener la comanda de la mesa',
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

export const addProductoToComanda = async (req, res) => {
  const { comandaId } = req.params;
  const { productoId } = req.body;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [productos] = await connection.query(
      `
      SELECT id, precio, activo
      FROM productos
      WHERE id = ?
      LIMIT 1
      `,
      [productoId]
    );

    if (productos.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        ok: false,
        message: 'Producto no encontrado',
      });
    }

    const producto = productos[0];

    if (!producto.activo) {
      await connection.rollback();
      return res.status(400).json({
        ok: false,
        message: 'El producto no está activo',
      });
    }

    const [detalleExistente] = await connection.query(
      `
      SELECT id, cantidad
      FROM comanda_detalle
      WHERE comanda_id = ? AND producto_id = ?
      LIMIT 1
      `,
      [comandaId, productoId]
    );

    if (detalleExistente.length > 0) {
      await connection.query(
        `
        UPDATE comanda_detalle
        SET cantidad = cantidad + 1
        WHERE id = ?
        `,
        [detalleExistente[0].id]
      );
    } else {
      await connection.query(
        `
        INSERT INTO comanda_detalle (comanda_id, producto_id, cantidad, precio_unitario)
        VALUES (?, ?, 1, ?)
        `,
        [comandaId, productoId, producto.precio]
      );
    }

    const [totales] = await connection.query(
      `
      SELECT COALESCE(SUM(cantidad * precio_unitario), 0) AS total
      FROM comanda_detalle
      WHERE comanda_id = ?
      `,
      [comandaId]
    );

    const nuevoTotal = totales[0].total || 0;

    await connection.query(
      `
      UPDATE comandas
      SET total = ?
      WHERE id = ?
      `,
      [nuevoTotal, comandaId]
    );

    await connection.commit();

    res.json({
      ok: true,
      message: 'Producto añadido correctamente',
      total: nuevoTotal,
    });
  } catch (error) {
    await connection.rollback();

    res.status(500).json({
      ok: false,
      message: 'Error al añadir producto a la comanda',
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

export const restarProductoDeComanda = async (req, res) => {
  const { comandaId, productoId } = req.params;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [detalleExistente] = await connection.query(
      `
      SELECT id, cantidad
      FROM comanda_detalle
      WHERE comanda_id = ? AND producto_id = ?
      LIMIT 1
      `,
      [comandaId, productoId]
    );

    if (detalleExistente.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        ok: false,
        message: 'Producto no encontrado en la comanda',
      });
    }

    const linea = detalleExistente[0];

    if (linea.cantidad > 1) {
      await connection.query(
        `
        UPDATE comanda_detalle
        SET cantidad = cantidad - 1
        WHERE id = ?
        `,
        [linea.id]
      );
    } else {
      await connection.query(
        `
        DELETE FROM comanda_detalle
        WHERE id = ?
        `,
        [linea.id]
      );
    }

    const [totales] = await connection.query(
      `
      SELECT COALESCE(SUM(cantidad * precio_unitario), 0) AS total
      FROM comanda_detalle
      WHERE comanda_id = ?
      `,
      [comandaId]
    );

    const nuevoTotal = totales[0].total || 0;

    await connection.query(
      `
      UPDATE comandas
      SET total = ?
      WHERE id = ?
      `,
      [nuevoTotal, comandaId]
    );

    await connection.commit();

    res.json({
      ok: true,
      message: 'Cantidad actualizada correctamente',
      total: nuevoTotal,
    });
  } catch (error) {
    await connection.rollback();

    res.status(500).json({
      ok: false,
      message: 'Error al restar producto de la comanda',
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

export const eliminarProductoDeComanda = async (req, res) => {
  const { comandaId, productoId } = req.params;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [detalleExistente] = await connection.query(
      `
      SELECT id
      FROM comanda_detalle
      WHERE comanda_id = ? AND producto_id = ?
      LIMIT 1
      `,
      [comandaId, productoId]
    );

    if (detalleExistente.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        ok: false,
        message: 'Producto no encontrado en la comanda',
      });
    }

    await connection.query(
      `
      DELETE FROM comanda_detalle
      WHERE id = ?
      `,
      [detalleExistente[0].id]
    );

    const [totales] = await connection.query(
      `
      SELECT COALESCE(SUM(cantidad * precio_unitario), 0) AS total
      FROM comanda_detalle
      WHERE comanda_id = ?
      `,
      [comandaId]
    );

    const nuevoTotal = totales[0].total || 0;

    await connection.query(
      `
      UPDATE comandas
      SET total = ?
      WHERE id = ?
      `,
      [nuevoTotal, comandaId]
    );

    await connection.commit();

    res.json({
      ok: true,
      message: 'Producto eliminado correctamente',
      total: nuevoTotal,
    });
  } catch (error) {
    await connection.rollback();

    res.status(500).json({
      ok: false,
      message: 'Error al eliminar producto de la comanda',
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

export const cobrarComanda = async (req, res) => {
  const { comandaId } = req.params;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [comandas] = await connection.query(
      `
      SELECT id, mesa_id, estado
      FROM comandas
      WHERE id = ?
      LIMIT 1
      `,
      [comandaId]
    );

    if (comandas.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        ok: false,
        message: 'Comanda no encontrada',
      });
    }

    const comanda = comandas[0];

    if (comanda.estado !== 'abierta') {
      await connection.rollback();
      return res.status(400).json({
        ok: false,
        message: 'La comanda no está abierta',
      });
    }

    await connection.query(
      `
      UPDATE comandas
      SET estado = 'cobrada',
          fecha_cierre = NOW()
      WHERE id = ?
      `,
      [comandaId]
    );

    await connection.query(
      `
      UPDATE mesas
      SET estado = 'libre'
      WHERE id = ?
      `,
      [comanda.mesa_id]
    );

    await connection.commit();

    res.json({
      ok: true,
      message: 'Comanda cobrada correctamente',
    });
  } catch (error) {
    await connection.rollback();

    res.status(500).json({
      ok: false,
      message: 'Error al cobrar la comanda',
      error: error.message,
    });
  } finally {
    connection.release();
  }
};