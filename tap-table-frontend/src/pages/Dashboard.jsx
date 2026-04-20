import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Dashboard() {
  const navigate = useNavigate();

  const [resumen, setResumen] = useState({
    mesasLibres: 0,
    mesasOcupadas: 0,
    pendientesCobro: 0,
    ventasDia: 0,
  });

  const [mesasRecientes, setMesasRecientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargarDashboard = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await axios.get('http://localhost:3001/api/dashboard');

        setResumen(response.data.resumen || {});
        setMesasRecientes(response.data.mesasRecientes || []);
      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar los datos del dashboard');
      } finally {
        setLoading(false);
      }
    };

    cargarDashboard();
  }, []);

  const formatearPrecio = (valor) => {
    const numero = Number(valor || 0);
    return `${numero.toFixed(2).replace('.', ',')} €`;
  };

  const tarjetasResumen = useMemo(() => {
    return [
      {
        id: 1,
        titulo: 'Mesas libres',
        valor: resumen.mesasLibres ?? 0,
        detalle: 'Disponibles ahora',
      },
      {
        id: 2,
        titulo: 'Mesas ocupadas',
        valor: resumen.mesasOcupadas ?? 0,
        detalle: 'Servicio en curso',
      },
      {
        id: 3,
        titulo: 'Pendientes de cobro',
        valor: resumen.pendientesCobro ?? 0,
        detalle: 'Listas para cerrar',
      },
      {
        id: 4,
        titulo: 'Ventas del día',
        valor: formatearPrecio(resumen.ventasDia ?? 0),
        detalle: 'Actualizado desde base de datos',
      },
    ];
  }, [resumen]);

  const accesos = [
    {
      id: 1,
      titulo: 'Gestionar mesas',
      texto: 'Consulta el estado y abre comandas rápidamente.',
      ruta: '/mesas',
    },
    {
      id: 2,
      titulo: 'Nueva comanda',
      texto: 'Accede al módulo de pedidos y añade productos.',
      ruta: '/comanda/1',
    },
    {
      id: 3,
      titulo: 'Panel admin',
      texto: 'Controla carta, precios y productos activos.',
      ruta: '/admin',
    },
  ];

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

  if (loading) {
    return (
      <main className="dashboard-page">
        <section className="dashboard-hero">
          <div>
            <p className="section-badge">Panel general</p>
            <h1>Bienvenido a Tap&Table</h1>
            <p className="dashboard-subtext">Cargando datos reales del dashboard...</p>
          </div>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="dashboard-page">
        <section className="dashboard-hero">
          <div>
            <p className="section-badge">Panel general</p>
            <h1>Bienvenido a Tap&Table</h1>
            <p className="dashboard-subtext">{error}</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="dashboard-page">
      <section className="dashboard-hero">
        <div>
          <p className="section-badge">Panel general</p>
          <h1>Bienvenido a Tap&Table</h1>
          <p className="dashboard-subtext">
            Supervisa el estado del local, consulta las ventas del día y accede
            rápidamente a los módulos principales del sistema.
          </p>
        </div>

        <button className="primary-action" onClick={() => navigate('/mesas')}>
          Abrir servicio
        </button>
      </section>

      <section className="stats-grid">
        {tarjetasResumen.map((item) => (
          <article key={item.id} className="stat-card">
            <p className="stat-title">{item.titulo}</p>
            <h2>{item.valor}</h2>
            <span>{item.detalle}</span>
          </article>
        ))}
      </section>

      <section className="dashboard-content">
        <div className="dashboard-panel">
          <div className="panel-header">
            <h3>Accesos rápidos</h3>
            <p>Módulos principales del sistema</p>
          </div>

          <div className="quick-actions">
            {accesos.map((item) => (
              <button
                key={item.id}
                className="quick-card quick-card-button"
                onClick={() => navigate(item.ruta)}
                type="button"
              >
                <h4>{item.titulo}</h4>
                <p>{item.texto}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="dashboard-panel">
          <div className="panel-header">
            <h3>Estado reciente de mesas</h3>
            <p>Resumen operativo actual</p>
          </div>

          <div className="table-status-list">
            {mesasRecientes.map((item) => (
              <div key={item.id} className="table-status-item">
                <div>
                  <strong>{`Mesa ${String(item.numero).padStart(2, '0')}`}</strong>
                  <p>{obtenerTextoEstado(item.estado)}</p>
                </div>
                <span>{formatearPrecio(item.total)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default Dashboard;