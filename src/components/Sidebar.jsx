
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

// ========================================
// NAVEGAÇÃO DA ÁREA DO ALUNO
// ========================================

const navigation = [
  {
    label: "PRINCIPAL",
    items: [
      { name: "Dashboard", path: "/dashboard", icon: "grid" },
      { name: "Cronograma", path: "/cronograma", icon: "calendar" },
    ],
  },
  {
    label: "ESTUDOS",
    items: [
      { name: "Atividades", path: "/atividades", icon: "clipboard" },
      { name: "Questões", path: "/questoes", icon: "book" },
      { name: "Redação", path: "/redacao", icon: "pen" },
      { name: "Simulados", path: "/simulados", icon: "target" },
      { name: "Desempenho", path: "/desempenho", icon: "chart" },
    ],
  },
];

// ========================================
// ÍCONES
// ========================================

const icons = {
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
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

  logout: (
    <>
      <path d="M10 17l5-5-5-5M15 12H3" />
      <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
    </>
  ),
};

// ========================================
// COMPONENTE DE ÍCONE
// ========================================

function SidebarIcon({ name }) {
  return (
    <svg
      className="minerva-sidebar__icon"
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

// ========================================
// SIDEBAR — ÁREA DO ALUNO
// ========================================

function Sidebar({ user, onLogout, onClose, isOpen = false }) {
  const displayName =
    user?.name || user?.nome || user?.nameCompleto || "Aluno";

  const profilePath = "/perfil";

  // Fecha o menu após selecionar uma página.
  function handleNavigation() {
    onClose?.();
  }

  return (
    <aside
      id="minerva-mobile-sidebar"
      className={`minerva-sidebar${isOpen ? " is-open" : ""}`}
      aria-label="Menu do aluno"
    >
      {/* Identidade da plataforma */}
      <div className="minerva-sidebar__brand">
        <div className="minerva-sidebar__owl" aria-hidden="true">
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

        <div className="minerva-sidebar__brand-text">
          <span className="minerva-sidebar__brand-name">minerva</span>
          <span className="minerva-sidebar__brand-caption">
            APRENDER. PRATICAR. EVOLUIR.
          </span>
        </div>
      </div>

      {/* Perfil do aluno */}
      <div className="minerva-sidebar__profile">
        <div className="minerva-sidebar__avatar">
          {displayName.charAt(0).toUpperCase()}
        </div>

        <div className="minerva-sidebar__profile-info">
          <span className="minerva-sidebar__profile-name">
            {displayName}
          </span>

          <span className="minerva-sidebar__profile-role">Aluno</span>
        </div>

        <span className="minerva-sidebar__profile-indicator" />
      </div>

      {/* Links de navegação */}
      <nav
        className="minerva-sidebar__nav"
        aria-label="Navegação principal"
      >
        {navigation.map((group) => (
          <div
            className="minerva-sidebar__group"
            key={group.label}
          >
            <span className="minerva-sidebar__group-label">
              {group.label}
            </span>

            {group.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleNavigation}
                className={({ isActive }) =>
                  `minerva-sidebar__link${isActive ? " is-active" : ""}`
                }
              >
                <SidebarIcon name={item.icon} />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </div>
        ))}

        {/* Acesso ao perfil */}
        <div className="minerva-sidebar__group minerva-sidebar__group--account">
          <span className="minerva-sidebar__group-label">CONTA</span>

          <NavLink
            to={profilePath}
            onClick={handleNavigation}
            className={({ isActive }) =>
              `minerva-sidebar__link${isActive ? " is-active" : ""}`
            }
          >
            <SidebarIcon name="user" />
            <span>Meu perfil</span>
          </NavLink>
        </div>
      </nav>

      {/* Rodapé e encerramento de sessão */}
      {onLogout && (
        <div className="minerva-sidebar__footer">
          <button
            type="button"
            className="minerva-sidebar__logout"
            onClick={onLogout}
          >
            <SidebarIcon name="logout" />
            <span>Sair da conta</span>
          </button>

          <span className="minerva-sidebar__version">
            MINERVA · ÁREA DO ALUNO
          </span>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
