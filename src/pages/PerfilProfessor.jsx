import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PerfilProfessor.css";

// ==========================================
// LEITURA E SALVAMENTO
// ==========================================

function readObject(key) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function readList(key) {
  try {
    const saved = localStorage.getItem(key);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

// ==========================================
// COMPONENTE
// ==========================================

export default function PerfilProfessor() {
  const navigate = useNavigate();

  const [user, setUser] = useState(() =>
    readObject("minervaLoggedUser")
  );

  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState(() => {
    const currentUser = readObject("minervaLoggedUser") || {};

    return {
      name: currentUser.name || "",
      email: currentUser.email || "",
      phone: currentUser.phone || currentUser.telefone || "",
      education:
        currentUser.education ||
        currentUser.formacao ||
        "",
      bio:
        currentUser.bio ||
        currentUser.apresentacao ||
        "",
    };
  });

  const subjects = Array.isArray(user?.subjects)
    ? user.subjects
    : user?.subject
      ? [user.subject]
      : user?.disciplina
        ? [user.disciplina]
        : [];

  const initial = (
    user?.name?.trim()?.charAt(0) || "P"
  ).toUpperCase();

  // ==========================================
  // ALTERAÇÕES DO FORMULÁRIO
  // ==========================================

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function startEditing() {
    setForm({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || user?.telefone || "",
      education: user?.education || user?.formacao || "",
      bio: user?.bio || user?.apresentacao || "",
    });

    setMessage("");
    setEditing(true);
  }

  function cancelEditing() {
    setForm({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || user?.telefone || "",
      education: user?.education || user?.formacao || "",
      bio: user?.bio || user?.apresentacao || "",
    });

    setEditing(false);
    setMessage("");
  }

  // ==========================================
  // SALVAR PERFIL
  // ==========================================

  function handleSave(event) {
    event.preventDefault();
    setMessage("");

    const name = form.name.trim();
    const email = form.email.trim();

    if (!name || !email) {
      setMessage("Preencha seu nome e e-mail.");
      return;
    }

    const users = readList("minervaUsers");

    const originalId = user?.id;
    const originalEmail = user?.email?.toLowerCase();

    const emailAlreadyUsed = users.some((item) => {
      const sameUser =
        originalId != null && item.id != null
          ? String(item.id) === String(originalId)
          : item.email?.toLowerCase() === originalEmail;

      return (
        !sameUser &&
        item.email?.toLowerCase() === email.toLowerCase()
      );
    });

    if (emailAlreadyUsed) {
      setMessage("Este e-mail já está cadastrado em outra conta.");
      return;
    }

    const updatedUser = {
      ...user,
      name,
      email,
      phone: form.phone.trim(),
      education: form.education.trim(),
      bio: form.bio.trim(),
    };

    const updatedUsers = users.map((item) => {
      const sameUser =
        originalId != null && item.id != null
          ? String(item.id) === String(originalId)
          : item.email?.toLowerCase() === originalEmail;

      return sameUser
        ? {
            ...item,
            name,
            email,
            phone: form.phone.trim(),
            education: form.education.trim(),
            bio: form.bio.trim(),
          }
        : item;
    });

    if (!persist("minervaUsers", updatedUsers)) {
      setMessage("Não foi possível salvar as alterações.");
      return;
    }

    if (!persist("minervaLoggedUser", updatedUser)) {
      setMessage(
        "Não foi possível atualizar a sessão. Tente novamente."
      );
      return;
    }

    setUser(updatedUser);
    setEditing(false);
    setMessage("Perfil atualizado com sucesso!");
  }

  // ==========================================
  // SAIR DA CONTA
  // ==========================================

  function handleLogout() {
    const confirmed = window.confirm(
      "Deseja realmente sair da sua conta?"
    );

    if (!confirmed) return;

    localStorage.removeItem("minervaLoggedUser");
    navigate("/login");
  }

  // ==========================================
  // VERIFICAÇÃO DA SESSÃO
  // ==========================================

  if (!user) {
    return (
      <main className="professor-content professor-profile-page">
        <section className="profile-empty">
          <h1>Você não está conectado</h1>
          <p>Entre na sua conta para visualizar seu perfil.</p>
          <button
            type="button"
            onClick={() => navigate("/login")}
          >
            Ir para o login
          </button>
        </section>
      </main>
    );
  }

  // ==========================================
  // TELA DO PERFIL
  // ==========================================

  return (
    <main className="professor-content professor-profile-page">
      <header className="profile-page-heading">
        <div>
          <p className="professor-label">
            MINERVA • ÁREA DO PROFESSOR
          </p>
          <h1>Meu perfil</h1>
          <p className="profile-subtitle">
            Gerencie suas informações pessoais e profissionais.
          </p>
        </div>
      </header>

      {message && (
        <div
          className="profile-message"
          role="status"
        >
          {message}
        </div>
      )}

      {/* CARTÃO PRINCIPAL */}

      <section className="profile-header">
        <div className="profile-avatar" aria-hidden="true">
          {initial}
        </div>

        <div className="profile-header-info">
          <h2>{user.name || "Professor"}</h2>
          <p>{user.email || "E-mail não informado"}</p>
          <span className="profile-role-badge">
            Professor
          </span>
        </div>

        {!editing && (
          <button
            className="profile-edit-button"
            type="button"
            onClick={startEditing}
          >
            Editar perfil
          </button>
        )}
      </section>

      <form
        className="profile-content"
        onSubmit={handleSave}
      >
        {/* INFORMAÇÕES PESSOAIS */}

        <section className="profile-card">
          <div className="profile-section-heading">
            <div>
              <h2>Informações pessoais</h2>
              <p>
                Dados básicos utilizados na sua conta.
              </p>
            </div>
          </div>

          <div className="profile-fields-grid">
            <label className="profile-field">
              <span>Nome completo</span>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                readOnly={!editing}
                required
                maxLength={100}
                placeholder="Seu nome completo"
              />
            </label>

            <label className="profile-field">
              <span>E-mail</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                readOnly={!editing}
                required
                maxLength={150}
                placeholder="seuemail@exemplo.com"
              />
            </label>

            <label className="profile-field">
              <span>Telefone <small>(opcional)</small></span>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                readOnly={!editing}
                maxLength={30}
                placeholder="Seu telefone"
              />
            </label>
          </div>
        </section>

        {/* INFORMAÇÕES PROFISSIONAIS */}

        <section className="profile-card">
          <div className="profile-section-heading">
            <div>
              <h2>Informações profissionais</h2>
              <p>
                Conheça e organize sua área de atuação.
              </p>
            </div>
          </div>

          <div className="profile-field profile-subjects-field">
            <span>Disciplinas vinculadas</span>

            {subjects.length > 0 ? (
              <div className="profile-subject-list">
                {subjects.map((subject) => (
                  <span
                    className="profile-subject-tag"
                    key={subject}
                  >
                    {subject}
                  </span>
                ))}
              </div>
            ) : (
              <p className="profile-no-data">
                Nenhuma disciplina vinculada à conta.
              </p>
            )}

            <small className="profile-helper">
              As disciplinas são definidas no cadastro ou pela administração.
            </small>
          </div>

          <div className="profile-fields-grid profile-professional-fields">
            <label className="profile-field">
              <span>Formação acadêmica</span>
              <input
                type="text"
                name="education"
                value={form.education}
                onChange={handleChange}
                readOnly={!editing}
                maxLength={150}
                placeholder="Ex.: Licenciatura em Matemática"
              />
            </label>

            <label className="profile-field profile-field-full">
              <span>Apresentação profissional</span>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                readOnly={!editing}
                maxLength={600}
                rows={4}
                placeholder="Conte um pouco sobre sua experiência, sua área de atuação e sua forma de ensinar."
              />
              <small className="profile-helper">
                {form.bio.length}/600 caracteres
              </small>
            </label>
          </div>
        </section>

        {/* AÇÕES */}

        {editing && (
          <div className="profile-form-actions">
            <button
              className="profile-cancel-button"
              type="button"
              onClick={cancelEditing}
            >
              Cancelar
            </button>

            <button
              className="profile-save-button"
              type="submit"
            >
              Salvar alterações
            </button>
          </div>
        )}
      </form>

      {/* SEGURANÇA DA CONTA */}

      <section className="profile-card profile-account-card">
        <div className="profile-section-heading">
          <div>
            <h2>Conta e segurança</h2>
            <p>
              Encerre sua sessão neste dispositivo.
            </p>
          </div>
        </div>

        <div className="profile-logout-card">
          <div>
            <h3>Sair da conta</h3>
            <p>
              Você precisará entrar novamente para acessar o Minerva.
            </p>
          </div>

          <button
            className="profile-logout-button"
            type="button"
            onClick={handleLogout}
          >
            Sair da conta
          </button>
        </div>
      </section>
    </main>
  );
}