import { useState } from "react";
import "./AdminTurmas.css";
import subjects from "../data/subjects";

function AdminTurmas() {
const [selectedSubject, setSelectedSubject] = useState(null);

const [users] = useState(() => {
const savedUsers = localStorage.getItem("minervaUsers");

if (!savedUsers) {
  return [];
}

try {
  return JSON.parse(savedUsers);
} catch {
  return [];
}

});

const students = users.filter(
(user) => user.userType === "aluno"
);

function getStudentsBySubject(subject) {
return students.filter((student) =>
student.subjects?.includes(subject)
);
}

return (
<main className="admin-content admin-turmas">

  <section className="admin-welcome">
    <p className="admin-label">
      DISCIPLINAS E TURMAS
    </p>

    <h1>
      Disciplinas e turmas
    </h1>

    <p className="admin-description">
      Gerencie as disciplinas disponíveis no Minerva
      e suas respectivas turmas.
    </p>
  </section>

  <section className="admin-grid">

    <div className="admin-card">
      <span>
        DISCIPLINAS
      </span>

      <h2>
        {subjects.length}
      </h2>

      <p>
        Disciplinas disponíveis
      </p>
    </div>

    <div className="admin-card">
      <span>
        TURMAS
      </span>

      <h2>
        {subjects.length}
      </h2>

      <p>
        Uma turma por disciplina
      </p>
    </div>

    <div className="admin-card">
      <span>
        ALUNOS
      </span>

      <h2>
        {students.length}
      </h2>

      <p>
        Alunos cadastrados
      </p>
    </div>

  </section>

  <section className="admin-section">

    <div className="section-header">
      <h2>
        Disciplinas disponíveis
      </h2>
    </div>

    <ul className="admin-list">

      {subjects.map((subject) => {

        const subjectStudents =
          getStudentsBySubject(subject);

        return (
          <li key={subject}>

            <div>
              <span>
                DISCIPLINA
              </span>

              <p>
                {subject}
              </p>

              <small>
                Turma de {subject}
              </small>
            </div>

            <div>
              <span>
                ALUNOS
              </span>

              <p>
                {subjectStudents.length}
              </p>
            </div>

            <div>
              <button
                type="button"
                onClick={() =>
                  setSelectedSubject(subject)
                }
              >
                Ver turma
              </button>
            </div>

          </li>
        );
      })}

    </ul>

  </section>

  {selectedSubject && (
    <section className="admin-section">

      <div className="section-header">
        <h2>
          Turma de {selectedSubject}
        </h2>
      </div>

      <div className="admin-card">

        <span>
          PROFESSOR RESPONSÁVEL
        </span>

        <h2>
          Ainda não definido
        </h2>

        <p>
          O professor responsável poderá ser
          associado posteriormente.
        </p>

      </div>

      <div className="admin-section">

        <div className="section-header">
          <h2>
            Alunos da turma
          </h2>
        </div>

        {getStudentsBySubject(selectedSubject).length === 0 ? (
          <p className="admin-description">
            Nenhum aluno participa desta turma ainda.
          </p>
        ) : (
          <ul className="admin-list">

            {getStudentsBySubject(selectedSubject).map(
              (student) => (
                <li key={student.id}>

                  <div>
                    <span>
                      ALUNO
                    </span>

                    <p>
                      {student.name}
                    </p>

                    <small>
                      {student.email}
                    </small>
                  </div>

                  <div>
                    <span>
                      STATUS
                    </span>

                    <p>
                      {student.status === "ativo" &&
                        "Ativo"}

                      {student.status === "pendente" &&
                        "Pendente"}

                      {student.status === "bloqueado" &&
                        "Bloqueado"}
                    </p>
                  </div>

                </li>
              )
            )}

          </ul>
        )}

      </div>

    </section>
  )}

</main>

);
}

export default AdminTurmas;