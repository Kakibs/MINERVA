import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

import users from "../data/users";

// Logo do Minerva (coruja), em SVG, sem biblioteca
function OwlMark() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path
        d="M8 10l8 5h16l8-5v18c0 8-7 14-16 14S8 36 8 28V10z"
        fill="currentColor"
      />
      <circle cx="18" cy="26" r="5" fill="#080b12" />
      <circle cx="30" cy="26" r="5" fill="#080b12" />
      <circle cx="18" cy="26" r="2" fill="#93c5fd" />
      <circle cx="30" cy="26" r="2" fill="#93c5fd" />
      <path d="M24 30l-2 4h4l-2-4z" fill="#93c5fd" />
    </svg>
  );
}

function Login() {
  const [userType, setUserType] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  function getAllUsers() {
    const savedUsers = localStorage.getItem("minervaUsers");

    if (savedUsers) {
      try {
        const parsed = JSON.parse(savedUsers);

        // ALTERADO: se o dado salvo não for uma lista, usa a lista inicial
        return Array.isArray(parsed) ? parsed : [...users];
      } catch {
        return [...users];
      }
    }

    const initialUsers = [...users];

    localStorage.setItem(
      "minervaUsers",
      JSON.stringify(initialUsers)
    );

    return initialUsers;
  }

  function handleLogin(event) {
    event.preventDefault();

    setError("");

    const allUsers = getAllUsers();

    // ALTERADO: ignora espaços no e-mail e não quebra se faltar e-mail em algum usuário
    const typedEmail = email.trim().toLowerCase();

    const user = allUsers.find(
      (item) =>
        String(item.email || "").toLowerCase() === typedEmail &&
        item.password === password &&
        item.userType === userType
    );

    if (!user) {
      setError("E-mail, senha ou tipo de acesso incorreto.");
      return;
    }

    if (user.status === "pendente") {
      setError(
        "Seu cadastro ainda não foi liberado pelo administrador."
      );
      return;
    }

    if (user.status === "bloqueado") {
      setError(
        "Sua conta está bloqueada. Procure o administrador."
      );
      return;
    }

    // CORRIGIDO: a sessão é gravada SEM a senha.
    // Antes o objeto inteiro (com password) ia para o localStorage.
    const sessionUser = { ...user };

    delete sessionUser.password;

    localStorage.setItem(
      "minervaLoggedUser",
      JSON.stringify(sessionUser)
    );

    if (user.userType === "aluno") {
      navigate("/");
      return;
    }

    if (user.userType === "professor") {
      navigate("/professor");
      return;
    }

    if (user.userType === "admin") {
      navigate("/admin");
    }
  }

  function handleChangeUserType() {
    setUserType(null);
    setEmail("");
    setPassword("");
    setError("");
  }

  return (
    <main className="login-page">
      <section className="login-card">

        <div className="login-header">
          <span className="login-logo">
            <OwlMark />
          </span>

          <p className="login-label">
            MINERVA
          </p>

          <h1>
            Entrar
          </h1>

          <p>
            Selecione como você deseja acessar o Minerva.
          </p>
        </div>

        {!userType ? (
          <div className="login-type-selection">

            <button
              type="button"
              className="login-type-button"
              onClick={() => setUserType("aluno")}
            >
              <strong>
                Aluno
              </strong>

              <span>
                Acessar minha área de estudos
              </span>
            </button>

            <button
              type="button"
              className="login-type-button"
              onClick={() => setUserType("professor")}
            >
              <strong>
                Professor
              </strong>

              <span>
                Acessar minha área de professor
              </span>
            </button>

            <button
              type="button"
              className="login-type-button"
              onClick={() => setUserType("admin")}
            >
              <strong>
                Administrador
              </strong>

              <span>
                Acessar a área administrativa
              </span>
            </button>

          </div>
        ) : (
          <form
            className="login-form"
            onSubmit={handleLogin}
          >

            <div className="login-selected-type">

              <span>
                {userType === "aluno" && "Aluno"}

                {userType === "professor" && "Professor"}

                {userType === "admin" && "Administrador"}
              </span>

              <button
                type="button"
                onClick={handleChangeUserType}
              >
                Alterar
              </button>

            </div>

            <label>
              E-mail

              <input
                type="email"
                placeholder="seu@email.com"
                autoComplete="email"
                required
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
              />
            </label>

            <label>
              Senha

              <input
                type="password"
                placeholder="Digite sua senha"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
              />
            </label>

            {error && (
              <p className="login-error" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="login-submit"
            >
              Entrar
            </button>

            {userType !== "admin" && (
              <p className="login-register">
                Ainda não possui uma conta?{" "}

                <Link to="/cadastro">
                  Criar conta
                </Link>
              </p>
            )}

          </form>
        )}

        <p className="login-tagline">
          Minerva não precisa conter tudo. Ele precisa conectar tudo.
        </p>

      </section>
    </main>
  );
}

export default Login;