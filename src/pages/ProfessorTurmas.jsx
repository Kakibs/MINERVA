import { useState } from "react";
import "./ProfessorTurmas.css";
import subjects from "../data/subjects";

function ProfessorTurmas() {
const [users] = useState(() => {
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

const [selectedSubject, setSelectedSubject] =
useState(null);

const savedUser = localStorage.getItem(
"minervaLoggedUser"
);

let loggedProfessor = null;

try {
if (savedUser) {
loggedProfessor = JSON.parse(savedUser);
}
} catch {
loggedProfessor = null;
}

const professorSubjects =
loggedProfessor?.subjects || [];

const professorAvailableSubjects =
subjects.filter((subject) =>
professorSubjects.includes(subject)
);

const students = users.filter(
(user) =>
user.userType === "aluno" &&
user.status === "ativo"
);

function getStudentsBySubject(subject) {
return students.filter((student) =>
student.subjects?.includes(subject)
);
}

return (
<main className="professor-turmas-page">

  <section className="professor-welcome">

    <p className="professor-label">
      TURMAS
    </p>

    <h1>
      Minhas turmas
    </h1>

    <p className="professor-description">
      Consulte as turmas das disciplinas que você
      leciona e os alunos de cada turma.
    </p>

  </section>

  <section className="professor-grid">

    <div className="professor-card">
      <span>
        MINHAS TURMAS
      </span>

      <h2>
        {professorAvailableSubjects.length}
      </h2>

      <p>
        Disciplinas associadas
      </p>
    </div>

    <div className="professor-card">
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

  <section className="professor-section">

    <div className="professor-section-header">

      <div>
        <h2>
          Minhas disciplinas
        </h2>

        <p className="professor-description">
          Estas são as disciplinas associadas à sua
          conta pelo administrador.
        </p>
      </div>

    </div>

    {professorAvailableSubjects.length === 0 ? (

      <div className="professor-card">

        <h2>
          Nenhuma disciplina associada
        </h2>

        <p className="professor-description">
          O administrador ainda não associou
          nenhuma disciplina à sua conta.
        </p>

      </div>

    ) : (

      <ul className="professor-list">

        {professorAvailableSubjects.map(
          (subject) => {

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
                    {subjectStudents.length} aluno(s)
                  </small>
                </div>

                <div>
                  <span>
                    TURMA
                  </span>

                  <p>
                    Turma de {subject}
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
          }
        )}

      </ul>

    )}

  </section>

  {selectedSubject && (

    <section className="professor-section">

      <div className="professor-section-header">

        <div>

          <span>
            TURMA
          </span>

          <h2>
            Turma de {selectedSubject}
          </h2>

        </div>

        <button
          type="button"
          onClick={() =>
            setSelectedSubject(null)
          }
        >
          Fechar
        </button>

      </div>

      {getStudentsBySubject(
        selectedSubject
      ).length === 0 ? (

        <div className="professor-card">

          <h2>
            Nenhum aluno nesta turma
          </h2>

          <p className="professor-description">
            Ainda não há alunos ativos nesta
            disciplina.
          </p>

        </div>

      ) : (

        <ul className="professor-list">

          {getStudentsBySubject(
            selectedSubject
          ).map((student) => (

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
                  Ativo
                </p>

              </div>

            </li>

          ))}

        </ul>

      )}

    </section>

  )}

</main>

);
}

export default ProfessorTurmas;