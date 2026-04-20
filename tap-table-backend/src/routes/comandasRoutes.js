import express from 'express';
import {
  getComandaByMesa,
  addProductoToComanda,
  restarProductoDeComanda,
  eliminarProductoDeComanda,
  cobrarComanda,
} from '../controllers/comandasController.js';

const router = express.Router();

router.get('/mesa/:mesaId', getComandaByMesa);
router.post('/:comandaId/productos', addProductoToComanda);
router.patch('/:comandaId/productos/:productoId/restar', restarProductoDeComanda);
router.delete('/:comandaId/productos/:productoId', eliminarProductoDeComanda);
router.patch('/:comandaId/cobrar', cobrarComanda);

export default router;