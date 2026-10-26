import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import users from "../data/users";
import subjects from "../data/subjects";

function Cadastro() {
const navigate = useNavigate();
const [searchParams] = useSearchParams();

const initialType =
searchParams.get("tipo") === "professor"
? "professor"
: "aluno";

const [userType, setUserType] = useState(initialType);

const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");

const [selectedSubjects, setSelectedSubjects] = useState([]);

const [error, setError] = useState("");
const [success, setSuccess] = useState("");

const allSubjectsSelected =
selectedSubjects.length === subjects.length;

function getSavedUsers() {
const savedUsers = localStorage.getItem("minervaUsers");
const oldSavedUsers = localStorage.getItem("minervaUser");

let currentUsers = [];

if (savedUsers) {
  try {
    currentUsers = JSON.parse(savedUsers);
  } catch {
    currentUsers = [];
  }
}

if (oldSavedUsers) {
  try {
    const oldUser = JSON.parse(oldSavedUsers);

    if (
      oldUser &&
      !Array.isArray(oldUser)
    ) {
      const alreadyExists = currentUsers.some(
        (user) => user.email === oldUser.email
      );

      if (!alreadyExists) {
        currentUsers.push({
          id: Date.now(),
          ...oldUser,
          status: oldUser.status || "pendente",
          subjects: oldUser.subjects || [],
        });
      }
    }

    if (Array.isArray(oldUser)) {
      oldUser.forEach((user) => {
        const alreadyExists = currentUsers.some(
          (item) => item.email === user.email
        );

        if (!alreadyExists) {
          currentUsers.push(user);
        }
      });
    }
  } catch {
    // Ignora dados antigos inválidos.
  }
}

if (currentUsers.length === 0) {
  currentUsers = [...users];
}

localStorage.setItem(
  "minervaUsers",
  JSON.stringify(currentUsers)
);

return currentUsers;

}

function handleAllSubjectsChange() {
if (allSubjectsSelected) {
setSelectedSubjects([]);
return;
}

setSelectedSubjects([...subjects]);

}

function handleSubjectChange(subject) {
setSelectedSubjects((currentSubjects) => {
if (currentSubjects.includes(subject)) {
return currentSubjects.filter(
(item) => item !== subject
);
}

  return [...currentSubjects, subject];
});

}

function handleSubmit(event) {
event.preventDefault();

setError("");
setSuccess("");

const trimmedName = name.trim();
const trimmedEmail = email.trim().toLowerCase();

if (!trimmedName || !trimmedEmail || !password) {
  setError("Preencha todos os campos.");
  return;
}

if (password.length < 6) {
  setError("A senha deve ter pelo menos 6 caracteres.");
  return;
}

if (
  userType === "aluno" &&
  selectedSubjects.length === 0
) {
  setError("Selecione pelo menos uma disciplina.");
  return;
}

const currentUsers = getSavedUsers();

const emailAlreadyExists = currentUsers.some(
  (user) =>
    user.email.toLowerCase() === trimmedEmail
);

if (emailAlreadyExists) {
  setError("Este e-mail já possui uma conta.");
  return;
}

const newUser = {
  id: Date.now(),
  name: trimmedName,
  email: trimmedEmail,
  password,
  userType,
  status: "pendente",
  subjects:
    userType === "aluno"
      ? selectedSubjects
      : [],
};

const updatedUsers = [
  ...currentUsers,
  newUser,
];

localStorage.setItem(
  "minervaUsers",
  JSON.stringify(updatedUsers)
);

setSuccess(
  "Cadastro realizado! Seu acesso está aguardando aprovação do administrador."
);

setName("");
setEmail("");
setPassword("");
setSelectedSubjects([]);

setTimeout(() => {
  navigate("/login");
}, 1800);

}

return (
<main className="login-page">
<section className="login-card">

    <div className="login-header">
      <p className="login-label">
        MINERVA
      </p>

      <h1>
        Criar conta
      </h1>

      <p>
        Crie seu acesso ao Minerva.
      </p>
    </div>

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
          Criar minha conta de aluno
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
          Criar minha conta de professor
        </span>
      </button>

    </div>

    <form
      className="login-form"
      onSubmit={handleSubmit}
    >

      <div className="login-selected-type">
        <span>
          {userType === "aluno"
            ? "Cadastro de aluno"
            : "Cadastro de professor"}
        </span>

        <button
          type="button"
          onClick={() => {
            setUserType(
              userType === "aluno"
                ? "professor"
                : "aluno"
            );

            setError("");
            setSuccess("");
          }}
        >
          Alterar
        </button>
      </div>

      <label>
        Nome completo

        <input
          type="text"
          placeholder="Digite seu nome"
          value={name}
          onChange={(event) =>
            setName(event.target.value)
          }
        />
      </label>

      <label>
        E-mail

        <input
          type="email"
          placeholder="seu@email.com"
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
          placeholder="Crie uma senha"
          value={password}
          onChange={(event) =>
            setPassword(event.target.value)
          }
        />
      </label>

      {userType === "aluno" && (
        <div>
          <label>
            Disciplinas
          </label>

          <div>

            <label>
              <input
                type="checkbox"
                checked={allSubjectsSelected}
                onChange={handleAllSubjectsChange}
              />

              Todas as disciplinas
            </label>

            {subjects.map((subject) => (
              <label key={subject}>
                <input
                  type="checkbox"
                  checked={selectedSubjects.includes(subject)}
                  onChange={() =>
                    handleSubjectChange(subject)
                  }
                />

                {subject}
              </label>
            ))}

          </div>
        </div>
      )}

      {error && (
        <p className="login-error">
          {error}
        </p>
      )}

      {success && (
        <p className="login-error">
          {success}
        </p>
      )}

      <button
        type="submit"
        className="login-submit"
      >
        Criar conta
      </button>

      <p className="login-register">
        Já possui uma conta?{" "}

        <Link to="/login">
          Voltar para o login
        </Link>
      </p>

    </form>

  </section>
</main>

);
}

export default Cadastro;