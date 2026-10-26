import { useState } from "react";
import "./AdminDashboard.css";

function readList(key) {
  try {
    const data = JSON.parse(
      localStorage.getItem(key) || "[]"
    );

    if (Array.isArray(data)) {
      return data;
    }

    return [];
  } catch {
    return [];
  }
}

function formatDate(dateValue) {
  if (!dateValue) {
    return "Sem data";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Sem data";
  }

  return date.toLocaleDateString("pt-BR");
}

function AdminDashboard() {
  const [users] = useState(() =>
    readList("minervaUsers")
  );

  
  /*
   * ============================================================
   * USUÁRIOS
   * ============================================================
   */

  const alunos = users.filter(
    (user) => user.userType === "aluno"
  );

  const professores = users.filter(
    (user) => user.userType === "professor"
  );

  const professoresPendentes = professores.filter(
    (user) => user.status === "pendente"
  );

  /*
   * ============================================================
   * DISCIPLINAS
   * ============================================================
   *
   * As disciplinas são descobertas a partir das matérias
   * cadastradas nos alunos e professores.
   */

  const disciplinas = [];

  users.forEach((user) => {
    if (!Array.isArray(user.subjects)) {
      return;
    }

    user.subjects.forEach((subject) => {
      if (
        subject &&
        !disciplinas.includes(subject)
      ) {
        disciplinas.push(subject);
      }
    });
  });

  disciplinas.sort();

  /*
   * ============================================================
   * ATIVIDADE RECENTE
   * ============================================================
   *
   * Usamos somente usuários que possuem data de cadastro.
   * Caso os dados antigos não tenham createdAt, não inventamos
   * uma data.
   */

  const atividadesRecentes = users
    .filter((user) => user.createdAt)
    .sort(
      (a, b) =>
        new Date(b.createdAt) -
        new Date(a.createdAt)
    )
    .slice(0, 5);

  return (
    <main className="admin-content admin-dashboard">
      <section className="admin-welcome">
        <p className="admin-label">
          ÁREA ADMINISTRATIVA
        </p>

        <h1>
          Dashboard administrativo
        </h1>

        <p className="admin-description">
          Gerencie alunos, professores, disciplinas e a
          organização do Minerva.
        </p>
      </section>

      <section className="admin-grid">
        <div className="admin-card">
          <span>ALUNOS</span>

          <h2>
            {alunos.length > 0
              ? alunos.length
              : "Sem dados"}
          </h2>

          <p>
            {alunos.length > 0
              ? "Alunos cadastrados no Minerva."
              : "Nenhum aluno cadastrado."}
          </p>
        </div>

        <div className="admin-card">
          <span>PROFESSORES</span>

          <h2>
            {professores.length > 0
              ? professores.length
              : "Sem dados"}
          </h2>

          <p>
            {professores.length > 0
              ? "Professores cadastrados."
              : "Nenhum professor cadastrado."}
          </p>
        </div>

        <div className="admin-card">
          <span>DISCIPLINAS</span>

          <h2>
            {disciplinas.length > 0
              ? disciplinas.length
              : "Sem dados"}
          </h2>

          <p>
            {disciplinas.length > 0
              ? "Disciplinas disponíveis atualmente."
              : "Nenhuma disciplina cadastrada."}
          </p>
        </div>
      </section>

      <section className="admin-grid">
        <div className="admin-card">
          <span>PROFESSORES PENDENTES</span>

          <h2>
            {professoresPendentes.length > 0
              ? professoresPendentes.length
              : "Sem dados"}
          </h2>

          <p>
            {professoresPendentes.length > 0
              ? "Aguardando aprovação do administrador."
              : "Nenhum professor aguardando aprovação."}
          </p>
        </div>
      </section>

      <section className="admin-section">
        <div className="section-header">
          <h2>
            Atividade recente
          </h2>
        </div>

        <ul className="admin-list">
          {atividadesRecentes.length === 0 ? (
            <li>
              <div>
                <span>SEM ATIVIDADES</span>

                <p>
                  Ainda não existem atividades recentes
                  registradas.
                </p>
              </div>

              <span>Sem dados</span>
            </li>
          ) : (
            atividadesRecentes.map((user) => (
              <li key={user.id}>
                <div>
                  <span>
                    {user.userType === "aluno"
                      ? "NOVO ALUNO"
                      : user.userType === "professor"
                        ? "NOVO PROFESSOR"
                        : "NOVO USUÁRIO"}
                  </span>

                  <p>
                    {user.name || "Usuário"} cadastrado
                    no Minerva
                  </p>
                </div>

                <span>
                  {formatDate(user.createdAt)}
                </span>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="admin-section">
        <div className="section-header">
          <h2>
            Disciplinas disponíveis
          </h2>
        </div>

        <ul className="admin-list">
          {disciplinas.length === 0 ? (
            <li>
              <div>
                <span>SEM DADOS</span>

                <p>
                  Nenhuma disciplina foi cadastrada
                  ainda.
                </p>
              </div>
            </li>
          ) : (
            disciplinas.map((subject) => {
              const subjectStudents = alunos.filter(
                (aluno) =>
                  Array.isArray(aluno.subjects) &&
                  aluno.subjects.includes(subject)
              );

              const subjectTeachers = professores.filter(
                (professor) =>
                  Array.isArray(professor.subjects) &&
                  professor.subjects.includes(subject)
              );

              return (
                <li key={subject}>
                  <div>
                    <span>DISCIPLINA</span>

                    <p>
                      {subject}
                    </p>
                  </div>

                  <span>
                    {subjectTeachers.length > 0
                      ? `${subjectTeachers.length} professor(es)`
                      : "Sem professor"}
                  </span>

                  <span>
                    {subjectStudents.length > 0
                      ? `${subjectStudents.length} aluno(s)`
                      : "Sem alunos"}
                  </span>
                </li>
              );
            })
          )}
        </ul>
      </section>
    </main>
  );
}

export default AdminDashboard;