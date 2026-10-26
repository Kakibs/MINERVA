import { useState } from "react";
import "./AdminAlunos.css";

function readList(key) {
  try {
    const saved = localStorage.getItem(key);

    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function AdminAlunos() {
  const [users, setUsers] = useState(() =>
    readList("minervaUsers")
  );

  function updateUserStatus(userId, newStatus) {
    const updatedUsers = users.map((user) =>
      user.id === userId
        ? {
            ...user,
            status: newStatus,
          }
        : user
    );

    setUsers(updatedUsers);

    localStorage.setItem(
      "minervaUsers",
      JSON.stringify(updatedUsers)
    );
  }

  const students = users.filter(
    (user) => user.userType === "aluno"
  );

  const pendingStudents = students.filter(
    (user) => user.status === "pendente"
  );

  const activeStudents = students.filter(
    (user) => user.status === "ativo"
  );

  const blockedStudents = students.filter(
    (user) => user.status === "bloqueado"
  );

  return (
    <main className="admin-content admin-alunos">
      <section className="admin-welcome">
        <p className="admin-label">
          ALUNOS
        </p>

        <h1>
          Alunos
        </h1>

        <p className="admin-description">
          Gerencie os alunos cadastrados e controle
          o acesso deles ao Minerva.
        </p>
      </section>

      <section className="admin-grid">
        <div className="admin-card">
          <span>
            TOTAL
          </span>

          <h2>
            {students.length}
          </h2>

          <p>
            Alunos cadastrados
          </p>
        </div>

        <div className="admin-card">
          <span>
            PENDENTES
          </span>

          <h2>
            {pendingStudents.length}
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
            {activeStudents.length}
          </h2>

          <p>
            Com acesso liberado
          </p>
        </div>

        <div className="admin-card">
          <span>
            BLOQUEADOS
          </span>

          <h2>
            {blockedStudents.length}
          </h2>

          <p>
            Sem acesso ao Minerva
          </p>
        </div>
      </section>

      <section className="admin-section">
        <div className="section-header">
          <h2>
            Alunos cadastrados
          </h2>
        </div>

        {students.length === 0 ? (
          <p className="admin-description">
            Nenhum aluno cadastrado ainda.
          </p>
        ) : (
          <ul className="admin-list">
            {students.map((student) => (
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
                    DISCIPLINAS
                  </span>

                  <p>
                    {Array.isArray(student.subjects) &&
                    student.subjects.length > 0
                      ? student.subjects.join(", ")
                      : "Nenhuma disciplina"}
                  </p>
                </div>

                <div>
                  <span>
                    STATUS
                  </span>

                  <p>
                    {student.status === "pendente" &&
                      "Pendente"}

                    {student.status === "ativo" &&
                      "Ativo"}

                    {student.status === "bloqueado" &&
                      "Bloqueado"}
                  </p>
                </div>

                <div>
                  {student.status === "pendente" && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          updateUserStatus(
                            student.id,
                            "ativo"
                          )
                        }
                      >
                        Liberar
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          updateUserStatus(
                            student.id,
                            "bloqueado"
                          )
                        }
                      >
                        Bloquear
                      </button>
                    </>
                  )}

                  {student.status === "ativo" && (
                    <button
                      type="button"
                      onClick={() =>
                        updateUserStatus(
                          student.id,
                          "bloqueado"
                        )
                      }
                    >
                      Bloquear
                    </button>
                  )}

                  {student.status === "bloqueado" && (
                    <button
                      type="button"
                      onClick={() =>
                        updateUserStatus(
                          student.id,
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
    </main>
  );
}

export default AdminAlunos;