import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Mesas() {
  const navigate = useNavigate();

  const [mesas, setMesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargarMesas = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await axios.get('http://localhost:3001/api/mesas');
        setMesas(response.data.mesas || []);
      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar las mesas');
      } finally {
        setLoading(false);
      }
    };

    cargarMesas();
  }, []);

  const obtenerClaseEstado = (estado) => {
    switch (estado) {
      case 'libre':
        return 'estado libre';
      case 'ocupada':
        return 'estado ocupada';
      case 'servida':
        return 'estado servida';
      case 'pendiente':
        return 'estado pendiente';
      default:
        return 'estado';
    }
  };

  const obtenerTextoEstado = (estado) => {
    switch (estado) {
      case 'libre':
        return 'Libre';
      case 'ocupada':
        return 'Ocupada';
      case 'servida':
        return 'Servida';
      case 'pendiente':
        return 'Pendiente de cobro';
      default:
        return estado;
    }
  };

  const obtenerTextoSecundario = (mesa) => {
    switch (mesa.estado) {
      case 'libre':
        return 'Disponible';
      case 'ocupada':
        return mesa.total > 0 ? 'Servicio en curso' : 'Mesa abierta';
      case 'servida':
        return 'Pedido servido';
      case 'pendiente':
        return 'Lista para cobrar';
      default:
        return 'Estado desconocido';
    }
  };

  const formatearPrecio = (valor) => {
    const numero = Number(valor || 0);
    return `${numero.toFixed(2).replace('.', ',')} €`;
  };

  if (loading) {
    return (
      <main className="mesas-page">
        <section className="mesas-header">
          <div>
            <p className="section-badge">Gestión de sala</p>
            <h1>Estado de mesas</h1>
            <p className="mesas-subtext">Cargando mesas desde la base de datos...</p>
          </div>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mesas-page">
        <section className="mesas-header">
          <div>
            <p className="section-badge">Gestión de sala</p>
            <h1>Estado de mesas</h1>
            <p className="mesas-subtext">{error}</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="mesas-page">
      <section className="mesas-header">
        <div>
          <p className="section-badge">Gestión de sala</p>
          <h1>Estado de mesas</h1>
          <p className="mesas-subtext">
            Consulta de un vistazo qué mesas están libres, ocupadas, servidas o pendientes de cobro.
          </p>
        </div>

        <div className="mesas-header-actions">
          <button
            className="secondary-action"
            type="button"
            onClick={() => navigate('/dashboard')}
          >
            Volver al dashboard
          </button>

          <button
            className="primary-action"
            type="button"
            onClick={() => navigate('/comanda/1')}
          >
            Nueva mesa
          </button>
        </div>
      </section>

      <section className="mesas-grid">
        {mesas.map((mesa) => (
          <article key={mesa.id} className="mesa-card">
            <div className="mesa-card-top">
              <span className="mesa-number">Mesa {String(mesa.numero).padStart(2, '0')}</span>
              <span className={obtenerClaseEstado(mesa.estado)}>
                {obtenerTextoEstado(mesa.estado)}
              </span>
            </div>

            <div className="mesa-card-body">
              <h3>{formatearPrecio(mesa.total)}</h3>
              <p>{obtenerTextoSecundario(mesa)}</p>
            </div>

            <div className="mesa-card-footer">
              <span>{mesa.capacidad} personas</span>
              <button
                className="mesa-action-button"
                type="button"
                onClick={() => navigate(`/comanda/${mesa.id}`)}
              >
                {mesa.estado === 'libre' ? 'Abrir mesa' : 'Ver comanda'}
              </button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

export default Mesas;