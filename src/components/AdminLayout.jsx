import { NavLink, Outlet } from "react-router-dom";
import "./AdminLayout.css";

function AdminLayout() {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">
          <h2>Minerva</h2>

          <span>Área administrativa</span>
        </div>

        <nav className="admin-menu">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `admin-menu-item ${
                isActive ? "active" : ""
              }`
            }
          >
            <span className="admin-menu-icon">
              🏠
            </span>

            <span>
              Dashboard
            </span>
          </NavLink>

          <NavLink
            to="/admin/alunos"
            className={({ isActive }) =>
              `admin-menu-item ${
                isActive ? "active" : ""
              }`
            }
          >
            <span className="admin-menu-icon">
              👥
            </span>

            <span>
              Alunos
            </span>
          </NavLink>

          <NavLink
            to="/admin/professores"
            className={({ isActive }) =>
              `admin-menu-item ${
                isActive ? "active" : ""
              }`
            }
          >
            <span className="admin-menu-icon">
              👨‍🏫
            </span>

            <span>
              Professores
            </span>
          </NavLink>

          <NavLink
            to="/admin/turmas"
            className={({ isActive }) =>
              `admin-menu-item ${
                isActive ? "active" : ""
              }`
            }
          >
            <span className="admin-menu-icon">
              📚
            </span>

            <span>
              Disciplinas e turmas
            </span>
          </NavLink>

          <NavLink
            to="/admin/cronograma"
            className={({ isActive }) =>
              `admin-menu-item ${
                isActive ? "active" : ""
              }`
            }
          >
            <span className="admin-menu-icon">
              📅
            </span>

            <span>
              Cronograma
            </span>
          </NavLink>

          <NavLink
            to="/admin/autorizacoes"
            className={({ isActive }) =>
              `admin-menu-item ${
                isActive ? "active" : ""
              }`
            }
          >
            <span className="admin-menu-icon">
              🔐
            </span>

            <span>
              Autorizações
            </span>
          </NavLink>
        </nav>

        <div className="admin-sidebar-bottom">
          <NavLink
            to="/admin/perfil"
            className={({ isActive }) =>
              `admin-menu-item ${
                isActive ? "active" : ""
              }`
            }
          >
            <span className="admin-menu-icon">
              👤
            </span>

            <span>
              Perfil
            </span>
          </NavLink>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-header">
          <div>
            <p>
              Área administrativa
            </p>

            <h2>
              Minerva
            </h2>
          </div>

          <div className="admin-user">
            <div className="admin-avatar">
              A
            </div>

            <div>
              <strong>
                Administrador
              </strong>

              <span>
                Administrador
              </span>
            </div>
          </div>
        </header>

        <div className="admin-page">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;