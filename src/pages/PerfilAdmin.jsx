import { useNavigate } from "react-router-dom";
import "./PerfilAdmin.css";

function PerfilAdmin() {
const navigate = useNavigate();

const savedUser = localStorage.getItem(
"minervaLoggedUser"
);

let user = null;

try {
if (savedUser) {
user = JSON.parse(savedUser);
}
} catch {
user = null;
}

function handleLogout() {
localStorage.removeItem("minervaLoggedUser");
navigate("/login");
}

return (
<main className="admin-content admin-perfil">

  <section className="admin-welcome">

    <p className="admin-label">
      PERFIL
    </p>

    <h1>
      Meu perfil
    </h1>

    <p className="admin-description">
      Consulte as informações da sua conta
      administrativa.
    </p>

  </section>

  <section className="admin-section">

    <div className="admin-card">

      <div className="admin-profile">

        <div className="admin-profile-avatar">
          {user?.name?.charAt(0).toUpperCase() || "A"}
        </div>

        <div>
          <span>
            ADMINISTRADOR
          </span>

          <h2>
            {user?.name || "Administrador"}
          </h2>

          <p>
            {user?.email || "admin@minerva.com"}
          </p>
        </div>

      </div>

    </div>

  </section>

  <section className="admin-section">

    <div className="admin-card">

      <span>
        ACESSO
      </span>

      <h2>
        Administrador
      </h2>

      <p className="admin-description">
        Esta conta possui acesso à área administrativa
        do Minerva.
      </p>

    </div>

  </section>

  <section className="admin-section">

    <div className="admin-card">

      <span>
        CONTA
      </span>

      <h2>
        Sair do Minerva
      </h2>

      <p className="admin-description">
        Encerre sua sessão atual e volte para a tela
        de login.
      </p>

      <button
        type="button"
        className="admin-logout-button"
        onClick={handleLogout}
      >
        Sair da conta
      </button>

    </div>

  </section>

</main>

);
}

export default PerfilAdmin;