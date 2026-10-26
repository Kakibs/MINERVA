
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "./ProfessorLayout.css";

const navigation = [
  {
    label: "PRINCIPAL",
    items: [
      { name: "Dashboard", path: "/professor", icon: "grid", end: true },
      { name: "Turmas", path: "/professor/turmas", icon: "users" },
      { name: "Cronograma", path: "/professor/cronograma", icon: "calendar" },
    ],
  },
  {
    label: "ACOMPANHAMENTO",
    items: [
      { name: "Atividades", path: "/professor/atividades", icon: "clipboard" },
      { name: "Questões", path: "/professor/questoes", icon: "book" },
      { name: "Redações", path: "/professor/redacoes", icon: "pen" },
      { name: "Simulados", path: "/professor/simulados", icon: "target" },
      { name: "Desempenho", path: "/professor/desempenho", icon: "chart" },
    ],
  },
];

const icons = {
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="10" cy="7" r="4" />
      <path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </>
  ),
  clipboard: (
    <>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4.5h6a1.5 1.5 0 0 0-1.5-1.5h-3A1.5 1.5 0 0 0 9 4.5ZM8 11h8M8 15h8" />
    </>
  ),
  book: (
    <>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 1 4 17.5z" />
      <path d="M4 17.5A2.5 2.5 0 0 1 6.5 15H20M8 7h7M8 10h7" />
    </>
  ),
  pen: (
    <>
      <path d="m14 5 5 5M4 20l4.5-1 11-11a2.1 2.1 0 0 0-3-3l-11 11z" />
      <path d="m13 6 5 5" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  chart: (
    <>
      <path d="M3 3v18h18" />
      <path d="m7 14 4-4 4 3 6-7" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
};

function SidebarIcon({ name }) {
  return (
    <svg
      className="professor-sidebar__icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icons[name]}
    </svg>
  );
}

function ProfessorLayout() {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  const loggedUser = (() => {
    try {
      return JSON.parse(
        localStorage.getItem("minervaLoggedUser") || "{}"
      );
    } catch {
      return {};
    }
  })();

  const professorName =
    loggedUser.name ||
    loggedUser.nome ||
    loggedUser.nameCompleto ||
    "Professor";

  const initial = professorName.charAt(0).toUpperCase();

  return (
    <div className="professor-layout">
      <aside className="professor-sidebar">
        <div className="professor-sidebar__brand">
          <div className="professor-sidebar__owl" aria-hidden="true">
            <svg viewBox="0 0 48 48" fill="none">
              <path
                d="M8 19 7 8l11 5a15 15 0 0 1 12 0l11-5-1 11a17 17 0 1 1-32 0Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <circle cx="18" cy="22" r="5" stroke="currentColor" strokeWidth="2" />
              <circle cx="30" cy="22" r="5" stroke="currentColor" strokeWidth="2" />
              <circle cx="18" cy="22" r="1.5" fill="currentColor" />
              <circle cx="30" cy="22" r="1.5" fill="currentColor" />
              <path
                d="m22 29 2 3 2-3M17 38l-2 4m16-4 2 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="professor-sidebar__brand-text">
            <span className="professor-sidebar__brand-name">minerva</span>
            <span className="professor-sidebar__brand-caption">
              APRENDER. PRATICAR. EVOLUIR.
            </span>
          </div>
        </div>

        <div className="professor-sidebar__profile">
          <div className="professor-sidebar__avatar">{initial}</div>
          <div className="professor-sidebar__profile-info">
            <span className="professor-sidebar__profile-name">
              {professorName}
            </span>
            <span className="professor-sidebar__profile-role">
              Professor
            </span>
          </div>
          <span className="professor-sidebar__profile-indicator" />
        </div>

        <nav className="professor-sidebar__nav" aria-label="Navegação do professor">
          {navigation.map((group) => (
            <div className="professor-sidebar__group" key={group.label}>
              <span className="professor-sidebar__group-label">
                {group.label}
              </span>

              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    `professor-sidebar__link${isActive ? " is-active" : ""}`
                  }
                >
                  <SidebarIcon name={item.icon} />
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </div>
          ))}

          <div className="professor-sidebar__group professor-sidebar__group--account">
            <span className="professor-sidebar__group-label">CONTA</span>
            <NavLink
              to="/professor/perfil"
              className={({ isActive }) =>
                `professor-sidebar__link${isActive ? " is-active" : ""}`
              }
            >
              <SidebarIcon name="user" />
              <span>Meu perfil</span>
            </NavLink>
          </div>
        </nav>

        <div className="professor-sidebar__footer">
          <span className="professor-sidebar__version">
            MINERVA · ÁREA DO PROFESSOR
          </span>
        </div>
      </aside>

      <div className="professor-main">
        <header className="professor-header">
          <div className="professor-header__heading">
            <div className="professor-header__eyebrow">
              <span>MINERVA</span>
              <span className="professor-header__separator">/</span>
              <span>ÁREA DO PROFESSOR</span>
            </div>
            <p className="professor-header__subtitle">
              Acompanhe suas turmas, atividades e desempenho.
            </p>
          </div>

          <div className="professor-header__right">
            <div className="professor-header__notification-wrapper">
              <button
                type="button"
                className={`professor-header__icon-button${
                  showNotifications ? " is-active" : ""
                }`}
                aria-label="Notificações"
                aria-expanded={showNotifications}
                title="Notificações"
                onClick={() => setShowNotifications((current) => !current)}
              >
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M10 21h4"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                </svg>
              </button>

              {showNotifications && (
                <div className="professor-header__notification-panel">
                  <div className="professor-header__notification-heading">
                    <strong>Notificações</strong>
                    <button
                      type="button"
                      aria-label="Fechar notificações"
                      onClick={() => setShowNotifications(false)}
                    >
                      ×
                    </button>
                  </div>
                  <p>Você verá suas notificações por aqui.</p>
                </div>
              )}
            </div>

            <button
              type="button"
              className="professor-header__profile"
              onClick={() => navigate("/professor/perfil")}
              title="Meu perfil"
            >
              <span className="professor-header__avatar">{initial}</span>
              <span className="professor-header__profile-info">
                <strong>{professorName}</strong>
                <small>Professor</small>
              </span>
              <svg
                className="professor-header__profile-arrow"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="m9 18 6-6-6-6"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </header>

        <main className="professor-page">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default ProfessorLayout;
