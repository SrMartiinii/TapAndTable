import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate('/dashboard');
  };

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand">
          <p className="brand-badge">TPV Hostelería</p>
          <h1>Tap&Table</h1>
          <p className="brand-text">
            Gestiona mesas, comandas y cobros desde una interfaz rápida,
            moderna y profesional.
          </p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Iniciar sesión</h2>

          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              placeholder="empleado@tapandtable.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="login-button">
            Entrar al sistema
          </button>
        </form>
      </section>
    </main>
  );
}

export default Login;