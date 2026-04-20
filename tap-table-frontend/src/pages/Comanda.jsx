import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

function Comanda() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [productos, setProductos] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState('');
  const [pedidoActual, setPedidoActual] = useState([]);
  const [comandaId, setComandaId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingProductId, setAddingProductId] = useState(null);
  const [updatingProductoId, setUpdatingProductoId] = useState(null);
  const [cobrando, setCobrando] = useState(false);
  const [error, setError] = useState('');

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError('');

      const [productosRes, comandaRes] = await Promise.all([
        axios.get('http://localhost:3001/api/productos'),
        axios.get(`http://localhost:3001/api/comandas/mesa/${id}`),
      ]);

      const productosBackend = productosRes.data.productos || [];
      const detalleBackend = comandaRes.data.detalle || [];
      const comanda = comandaRes.data.comanda || null;

      setProductos(productosBackend);
      setPedidoActual(
        detalleBackend.map((item) => ({
          id: item.producto_id,
          nombre: item.nombre,
          precio: Number(item.precio_unitario),
          cantidad: item.cantidad,
        }))
      );
      setComandaId(comanda?.id || null);

      if (productosBackend.length > 0) {
        const categoriasUnicas = [
          ...new Set(productosBackend.map((producto) => producto.categoria)),
        ];

        setCategoriaActiva((prev) =>
          prev && categoriasUnicas.includes(prev) ? prev : categoriasUnicas[0] || ''
        );
      }
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar los datos de la comanda');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const categorias = useMemo(() => {
    return [...new Set(productos.map((producto) => producto.categoria))];
  }, [productos]);

  const productosFiltrados = useMemo(() => {
    return productos.filter(
      (producto) => producto.categoria === categoriaActiva
    );
  }, [productos, categoriaActiva]);

  const formatearPrecio = (valor) => {
    const numero = Number(valor);
    return `${numero.toFixed(2).replace('.', ',')} €`;
  };

  const totalPedido = useMemo(() => {
    return pedidoActual.reduce(
      (acc, item) => acc + Number(item.precio) * item.cantidad,
      0
    );
  }, [pedidoActual]);

  const anadirProducto = async (producto) => {
    if (!comandaId) return;

    try {
      setAddingProductId(producto.id);
      setError('');

      await axios.post(`http://localhost:3001/api/comandas/${comandaId}/productos`, {
        productoId: producto.id,
      });

      await cargarDatos();
    } catch (err) {
      console.error(err);
      setError('No se pudo añadir el producto');
    } finally {
      setAddingProductId(null);
    }
  };

  const quitarProducto = async (productoId) => {
    if (!comandaId) return;

    try {
      setUpdatingProductoId(productoId);
      setError('');

      await axios.patch(
        `http://localhost:3001/api/comandas/${comandaId}/productos/${productoId}/restar`
      );

      await cargarDatos();
    } catch (err) {
      console.error(err);
      setError('No se pudo restar el producto');
    } finally {
      setUpdatingProductoId(null);
    }
  };

  const eliminarProducto = async (productoId) => {
    if (!comandaId) return;

    try {
      setUpdatingProductoId(productoId);
      setError('');

      await axios.delete(
        `http://localhost:3001/api/comandas/${comandaId}/productos/${productoId}`
      );

      await cargarDatos();
    } catch (err) {
      console.error(err);
      setError('No se pudo eliminar el producto');
    } finally {
      setUpdatingProductoId(null);
    }
  };

  const cobrarMesa = async () => {
    if (!comandaId) return;

    try {
      setCobrando(true);
      setError('');

      await axios.patch(`http://localhost:3001/api/comandas/${comandaId}/cobrar`);

      navigate('/mesas');
    } catch (err) {
      console.error(err);
      setError('No se pudo cobrar la mesa');
    } finally {
      setCobrando(false);
    }
  };

  if (loading) {
    return (
      <main className="comanda-page">
        <section className="comanda-header">
          <div>
            <p className="section-badge">Gestión de pedido</p>
            <h1>Comanda de la mesa {id}</h1>
            <p className="comanda-subtext">Cargando datos reales...</p>
          </div>
        </section>
      </main>
    );
  }

  if (error && productos.length === 0) {
    return (
      <main className="comanda-page">
        <section className="comanda-header">
          <div>
            <p className="section-badge">Gestión de pedido</p>
            <h1>Comanda de la mesa {id}</h1>
            <p className="comanda-subtext">{error}</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="comanda-page">
      <section className="comanda-header">
        <div>
          <p className="section-badge">Gestión de pedido</p>
          <h1>Comanda de la mesa {id}</h1>
          <p className="comanda-subtext">
            Comanda activa #{comandaId} · Añade productos y revisa el pedido actual.
          </p>
          {error ? <p className="comanda-error">{error}</p> : null}
        </div>

        <div className="comanda-header-actions">
          <button
            type="button"
            className="secondary-action"
            onClick={() => navigate('/mesas')}
          >
            Volver a mesas
          </button>

          <button
            type="button"
            className="primary-action"
            onClick={cobrarMesa}
            disabled={cobrando}
          >
            {cobrando ? 'Cobrando...' : 'Cobrar mesa'}
          </button>
        </div>
      </section>

      <section className="comanda-layout">
        <div className="comanda-left">
          <div className="comanda-panel">
            <div className="panel-header">
              <h3>Categorías</h3>
              <p>Selecciona un bloque del menú</p>
            </div>

            <div className="categorias-list">
              {categorias.map((categoria) => (
                <button
                  key={categoria}
                  type="button"
                  className={`categoria-chip ${
                    categoria === categoriaActiva ? 'activa' : ''
                  }`}
                  onClick={() => setCategoriaActiva(categoria)}
                >
                  {categoria}
                </button>
              ))}
            </div>
          </div>

          <div className="comanda-panel">
            <div className="panel-header">
              <h3>Productos</h3>
              <p>Añade artículos al pedido actual</p>
            </div>

            <div className="productos-grid">
              {productosFiltrados.map((producto) => (
                <article key={producto.id} className="producto-card">
                  <span className="producto-categoria">{producto.categoria}</span>
                  <h4>{producto.nombre}</h4>
                  <p>{formatearPrecio(producto.precio)}</p>
                  <button
                    type="button"
                    className="producto-add-button"
                    onClick={() => anadirProducto(producto)}
                    disabled={addingProductId === producto.id}
                  >
                    {addingProductId === producto.id ? 'Añadiendo...' : 'Añadir'}
                  </button>
                </article>
              ))}
            </div>
          </div>
        </div>

        <aside className="comanda-right">
          <div className="comanda-panel pedido-panel">
            <div className="panel-header">
              <h3>Pedido actual</h3>
              <p>Resumen en tiempo real</p>
            </div>

            <div className="pedido-list">
              {pedidoActual.length === 0 ? (
                <div className="pedido-vacio">
                  <p>No hay productos añadidos todavía.</p>
                </div>
              ) : (
                pedidoActual.map((item) => (
                  <div key={item.id} className="pedido-item">
                    <div className="pedido-item-info">
                      <strong>{item.nombre}</strong>
                      <p>
                        Cantidad: {item.cantidad} · Unitario:{' '}
                        {formatearPrecio(item.precio)}
                      </p>
                    </div>

                    <div className="pedido-item-actions">
                      <span>{formatearPrecio(item.precio * item.cantidad)}</span>

                      <div className="pedido-controls">
                        <button
                          type="button"
                          className="pedido-control-button"
                          onClick={() => quitarProducto(item.id)}
                          disabled={updatingProductoId === item.id}
                        >
                          −
                        </button>

                        <button
                          type="button"
                          className="pedido-delete-button"
                          onClick={() => eliminarProducto(item.id)}
                          disabled={updatingProductoId === item.id}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pedido-total">
              <div>
                <span>Total</span>
                <h3>{formatearPrecio(totalPedido)}</h3>
              </div>

              <button type="button" className="primary-action pedido-button">
                Confirmar pedido
              </button>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

export default Comanda;