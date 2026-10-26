import { useState } from "react";
import "./AdminProfessores.css";
import subjects from "../data/subjects";

function AdminProfessores() {
const [users, setUsers] = useState(() => {
const savedUsers = localStorage.getItem(
"minervaUsers"
);

if (!savedUsers) {
  return [];
}

try {
  return JSON.parse(savedUsers);
} catch {
  return [];
}

});

const [selectedProfessor, setSelectedProfessor] =
useState(null);

const [selectedSubjects, setSelectedSubjects] =
useState([]);

const professors = users.filter(
(user) => user.userType === "professor"
);

const pendingProfessors = professors.filter(
(professor) =>
professor.status === "pendente"
);

const activeProfessors = professors.filter(
(professor) =>
professor.status === "ativo"
);

function updateUsers(updatedUsers) {
setUsers(updatedUsers);

localStorage.setItem(
  "minervaUsers",
  JSON.stringify(updatedUsers)
);

}

function changeStatus(userId, newStatus) {
const updatedUsers = users.map((user) => {
if (user.id !== userId) {
return user;
}

  return {
    ...user,
    status: newStatus,
  };
});

updateUsers(updatedUsers);

}

function openSubjects(professor) {
setSelectedProfessor(professor);

setSelectedSubjects(
  professor.subjects || []
);

}

function handleSubjectChange(subject) {
setSelectedSubjects((currentSubjects) => {
if (currentSubjects.includes(subject)) {
return currentSubjects.filter(
(item) => item !== subject
);
}

  return [
    ...currentSubjects,
    subject,
  ];
});

}

function saveSubjects() {
if (!selectedProfessor) {
return;
}

const updatedUsers = users.map((user) => {
  if (user.id !== selectedProfessor.id) {
    return user;
  }

  return {
    ...user,
    subjects: selectedSubjects,
  };
});

updateUsers(updatedUsers);

const updatedProfessor = updatedUsers.find(
  (user) => user.id === selectedProfessor.id
);

setSelectedProfessor(updatedProfessor);
setSelectedSubjects(
  updatedProfessor?.subjects || []
);

}

return (
<main className="admin-content admin-professores">

  <section className="admin-welcome">

    <p className="admin-label">
      PROFESSORES
    </p>

    <h1>
      Professores
    </h1>

    <p className="admin-description">
      Gerencie os professores, seus acessos e as
      disciplinas que eles lecionam.
    </p>

  </section>

  <section className="admin-grid">

    <div className="admin-card">
      <span>
        PROFESSORES
      </span>

      <h2>
        {professors.length}
      </h2>

      <p>
        Professores cadastrados
      </p>
    </div>

    <div className="admin-card">
      <span>
        PENDENTES
      </span>

      <h2>
        {pendingProfessors.length}
      </h2>

      <p>
        Aguardando aprovação
      </p>
    </div>

    <div className="admin-card">
      <span>
        ATIVOS
      </span>

      <h2>
        {activeProfessors.length}
      </h2>

      <p>
        Professores com acesso
      </p>
    </div>

  </section>

  <section className="admin-section">

    <div className="section-header">

      <div>
        <h2>
          Professores cadastrados
        </h2>

        <p className="admin-description">
          Consulte e gerencie os professores do Minerva.
        </p>
      </div>

    </div>

    {professors.length === 0 ? (

      <p className="admin-description">
        Nenhum professor cadastrado ainda.
      </p>

    ) : (

      <ul className="admin-list">

        {professors.map((professor) => (

          <li key={professor.id}>

            <div>
              <span>
                PROFESSOR
              </span>

              <p>
                {professor.name}
              </p>

              <small>
                {professor.email}
              </small>
            </div>

            <div>
              <span>
                DISCIPLINAS
              </span>

              <p>
                {professor.subjects?.length > 0
                  ? professor.subjects.join(", ")
                  : "Nenhuma definida"}
              </p>
            </div>

            <div>
              <span>
                STATUS
              </span>

              <p>
                {professor.status === "ativo" &&
                  "Ativo"}

                {professor.status === "pendente" &&
                  "Pendente"}

                {professor.status === "bloqueado" &&
                  "Bloqueado"}
              </p>
            </div>

            <div>

              <button
                type="button"
                onClick={() =>
                  openSubjects(professor)
                }
              >
                Disciplinas
              </button>

              {professor.status === "pendente" && (

                <button
                  type="button"
                  onClick={() =>
                    changeStatus(
                      professor.id,
                      "ativo"
                    )
                  }
                >
                  Liberar
                </button>

              )}

              {professor.status === "ativo" && (

                <button
                  type="button"
                  onClick={() =>
                    changeStatus(
                      professor.id,
                      "bloqueado"
                    )
                  }
                >
                  Bloquear
                </button>

              )}

              {professor.status === "bloqueado" && (

                <button
                  type="button"
                  onClick={() =>
                    changeStatus(
                      professor.id,
                      "ativo"
                    )
                  }
                >
                  Liberar novamente
                </button>

              )}

            </div>

          </li>

        ))}

      </ul>

    )}

  </section>

  {selectedProfessor && (

    <section className="admin-section">

      <div className="section-header">

        <div>

          <span>
            PROFESSOR
          </span>

          <h2>
            {selectedProfessor.name}
          </h2>

          <p className="admin-description">
            Selecione todas as disciplinas que este
            professor poderá acessar.
          </p>

        </div>

        <button
          type="button"
          onClick={() => {
            setSelectedProfessor(null);
            setSelectedSubjects([]);
          }}
        >
          Fechar
        </button>

      </div>

      <div className="admin-card">

        <span>
          DISCIPLINAS
        </span>

        <h2>
          Disciplinas do professor
        </h2>

        <div className="admin-subject-list">

          {subjects.map((subject) => (

            <label
              key={subject}
              className="admin-subject-option"
            >

              <input
                type="checkbox"
                checked={selectedSubjects.includes(
                  subject
                )}
                onChange={() =>
                  handleSubjectChange(subject)
                }
              />

              <span>
                {subject}
              </span>

            </label>

          ))}

        </div>

        <button
          type="button"
          onClick={saveSubjects}
        >
          Salvar disciplinas
        </button>

      </div>

    </section>

  )}

</main>

);
}

export default AdminProfessores;