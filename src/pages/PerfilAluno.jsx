
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PerfilAluno.css";

function readUser() {
  try {
    const saved = localStorage.getItem("minervaLoggedUser");
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function readUsers() {
  try {
    const saved = localStorage.getItem("minervaUsers");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function getUserEmail(user) {
  return String(user?.email || "").trim().toLowerCase();
}

function PerfilAluno() {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => readUser());
  const [nickname, setNickname] = useState(
    () => readUser()?.nickname || readUser()?.apelido || ""
  );
  const [about, setAbout] = useState(
    () => readUser()?.about || readUser()?.sobre || ""
  );
  const [photo, setPhoto] = useState(
    () => readUser()?.profilePhoto || readUser()?.fotoPerfil || ""
  );
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const subjects = Array.isArray(user?.subjects) ? user.subjects : [];
  const fullName = String(user?.name || user?.nome || "Aluno").trim();
  const email = user?.email || "";
  const initial = fullName.charAt(0).toUpperCase() || "?";

  useEffect(() => {
    if (!message && !error) return undefined;

    const timeout = window.setTimeout(() => {
      setMessage("");
      setError("");
    }, 4000);

    return () => window.clearTimeout(timeout);
  }, [message, error]);

  function handlePhotoChange(event) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Escolha um arquivo de imagem válido.");
      setMessage("");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("A imagem deve ter no máximo 2 MB.");
      setMessage("");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setPhoto(reader.result);
        setError("");
        setMessage("Prévia da foto atualizada. Clique em salvar para confirmar.");
      }
    };

    reader.onerror = () => {
      setError("Não foi possível carregar essa imagem.");
      setMessage("");
    };

    reader.readAsDataURL(file);
  }

  function handleRemovePhoto() {
    setPhoto("");
    setMessage("Foto removida da prévia. Clique em salvar para confirmar.");
    setError("");
  }

  function handleSave(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const currentUser = readUser();

      if (!currentUser) {
        setError("Não encontramos sua sessão. Entre novamente na sua conta.");
        setSaving(false);
        return;
      }

      const updatedUser = {
        ...currentUser,
        nickname: nickname.trim(),
        about: about.trim(),
        profilePhoto: photo,
      };

      // Atualiza os dados da sessão sem alterar o nome completo.
      localStorage.setItem("minervaLoggedUser", JSON.stringify(updatedUser));

      // Atualiza também o cadastro local para preservar a personalização
      // quando o usuário entrar novamente.
      const users = readUsers();

      if (Array.isArray(users)) {
        const emailToMatch = getUserEmail(currentUser);

        const updatedUsers = users.map((savedUser) => {
          const sameEmail =
            emailToMatch &&
            getUserEmail(savedUser) === emailToMatch;

          const sameId =
            currentUser.id != null &&
            savedUser.id != null &&
            String(currentUser.id) === String(savedUser.id);

          if (!sameEmail && !sameId) return savedUser;

          return {
            ...savedUser,
            nickname: nickname.trim(),
            about: about.trim(),
            profilePhoto: photo,
          };
        });

        localStorage.setItem("minervaUsers", JSON.stringify(updatedUsers));
      }

      setUser(updatedUser);
      setMessage("Perfil atualizado com sucesso!");
    } catch {
      setError(
        "Não foi possível salvar. Tente usar uma imagem menor ou reduzir o texto."
      );
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("minervaLoggedUser");
    navigate("/login");
  }

  if (!user) {
    return (
      <main className="profile">
        <section className="profile-empty">
          <h1>Entre na sua conta</h1>
          <p>Faça login para consultar e personalizar seu perfil.</p>
          <button
            type="button"
            className="profile-primary-button"
            onClick={() => navigate("/login")}
          >
            Ir para o login
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="profile">
      <header className="profile-header">
        <p className="profile-label">SUA CONTA</p>
        <h1>Meu perfil</h1>
        <p className="profile-description">
          Personalize seu espaço no Minerva do seu jeito.
        </p>
      </header>

      {(message || error) && (
        <div
          className={`profile-feedback ${error ? "is-error" : "is-success"}`}
          role="status"
        >
          {error || message}
        </div>
      )}

      <form className="profile-content" onSubmit={handleSave}>
        <section className="profile-card profile-identity-card">
          <div className="profile-avatar-column">
            <div className="profile-avatar" aria-label="Foto de perfil">
              {photo ? (
                <img src={photo} alt="Foto de perfil" />
              ) : (
                <span>{initial}</span>
              )}
            </div>

            <label className="profile-photo-button">
              Alterar foto
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
              />
            </label>

            {photo && (
              <button
                type="button"
                className="profile-photo-remove"
                onClick={handleRemovePhoto}
              >
                Remover foto
              </button>
            )}
          </div>

          <div className="profile-identity-fields">
            <span className="profile-section-label">MEU PERFIL</span>

            <label className="profile-field">
              <span>Apelido</span>
              <input
                type="text"
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                placeholder="Como você quer ser chamado?"
                maxLength={40}
              />
              <small>
                O apelido aparecerá acima do seu nome completo.
              </small>
            </label>

            <div className="profile-full-name">
              <span>Nome completo</span>
              <strong>{fullName}</strong>
              <small>O nome completo não pode ser alterado por aqui.</small>
            </div>
          </div>
        </section>

        <section className="profile-card">
          <div className="profile-section">
            <span className="profile-section-label">INFORMAÇÕES</span>
            <h2>Sobre você</h2>
            <p className="profile-section-description">
              Suas informações de conta e um pouco sobre você.
            </p>

            <label className="profile-field profile-email-field">
              <span>E-mail da conta</span>
              <input type="email" value={email} readOnly />
              <small>O e-mail usado para entrar no Minerva não pode ser alterado aqui.</small>
            </label>

            <label className="profile-field profile-about-field">
              <span>Sobre mim</span>
              <textarea
                value={about}
                onChange={(event) => setAbout(event.target.value)}
                placeholder="Escreva um pouco sobre você, seus interesses ou seus objetivos..."
                rows={5}
                maxLength={500}
              />
              <small>{about.length}/500 caracteres</small>
            </label>
          </div>
        </section>

        <section className="profile-card">
          <div className="profile-section">
            <span className="profile-section-label">SEUS ESTUDOS</span>
            <h2>Disciplinas</h2>
            <p className="profile-section-description">
              Confira as disciplinas associadas à sua conta.
            </p>

            {subjects.length > 0 ? (
              <ul className="profile-subjects">
                {subjects.map((subject, index) => (
                  <li key={`${subject}-${index}`}>{subject}</li>
                ))}
              </ul>
            ) : (
              <p className="profile-no-subjects">
                Você ainda não tem disciplinas associadas à sua conta.
              </p>
            )}
          </div>
        </section>

        <div className="profile-form-actions">
          <button
            type="submit"
            className="profile-primary-button"
            disabled={saving}
          >
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </form>

      <section className="profile-logout-section">
        <div>
          <h2>Sair da conta</h2>
          <p>Encerre sua sessão neste dispositivo.</p>
        </div>

        <button
          type="button"
          className="profile-logout-button"
          onClick={handleLogout}
        >
          Sair
        </button>
      </section>
    </main>
  );
}

export default PerfilAluno;
