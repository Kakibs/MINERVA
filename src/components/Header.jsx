
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css";

function Header() {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  const user = JSON.parse(localStorage.getItem("minervaLoggedUser") || "null");
  const name = user?.name || user?.nome || "Aluno";
  const initial = name.charAt(0).toUpperCase();

  return (
    <header className="minerva-header">
      <div className="minerva-header__heading">
        <div className="minerva-header__eyebrow">
          <span>MINERVA</span>
          <span className="minerva-header__separator">/</span>
          <span>ÁREA DO ALUNO</span>
        </div>

        <p className="minerva-header__subtitle">
          Acompanhe suas atividades e seu progresso.
        </p>
      </div>

      <div className="minerva-header__right">
        <div className="minerva-header__notification-wrapper">
          <button
            type="button"
            className={`minerva-header__icon-button ${
              showNotifications ? "is-active" : ""
            }`}
            aria-label="Notificações"
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
            <div className="minerva-header__notification-panel">
              <div className="minerva-header__notification-heading">
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
          className="minerva-header__profile"
          onClick={() => navigate("/perfil")}
          title="Meu perfil"
        >
          <span className="minerva-header__avatar">{initial}</span>

          <span className="minerva-header__profile-info">
            <strong>{name}</strong>
            <small>Aluno</small>
          </span>

          <svg
            className="minerva-header__profile-arrow"
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
  );
}

export default Header;
