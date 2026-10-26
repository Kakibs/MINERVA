import { useEffect, useState } from "react";
import "./AdminAutorizacoes.css";

function readList(key) {
  try {
    const data = JSON.parse(localStorage.getItem(key));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function persist(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function AdminAutorizacoes() {
  const [users, setUsers] = useState(() =>
    readList("minervaUsers")
  );

  const [autorizacoes, setAutorizacoes] = useState(() =>
    readList("minervaAutorizacoes")
  );

  useEffect(() => {
    const atualizarDados = () => {
      setUsers(readList("minervaUsers"));
      setAutorizacoes(readList("minervaAutorizacoes"));
    };

    window.addEventListener("storage", atualizarDados);

    return () => {
      window.removeEventListener("storage", atualizarDados);
    };
  }, []);

  const alunos = users.filter(
    (user) =>
      user.userType === "aluno" &&
      user.status === "ativo"
  );

  const autorizacoesAtivas = autorizacoes.filter(
    (item) => item.status === "ativo"
  );

  const autorizacoesPendentes = autorizacoes.filter(
    (item) => item.status === "pendente"
  );

  function getAutorizacao(alunoId) {
    return autorizacoes.find(
      (item) => Number(item.alunoId) === Number(alunoId)
    );
  }

  function autorizarAluno(aluno) {
    const novaAutorizacao = {
      id: `autorizacao-${aluno.id}`,
      alunoId: aluno.id,
      alunoName: aluno.name,
      alunoEmail: aluno.email,
      status: "ativo",
      authorizedAt: new Date().toISOString(),
    };

    const outrasAutorizacoes = autorizacoes.filter(
      (item) => Number(item.alunoId) !== Number(aluno.id)
    );

    const novasAutorizacoes = [
      ...outrasAutorizacoes,
      novaAutorizacao,
    ];

    setAutorizacoes(novasAutorizacoes);
    persist("minervaAutorizacoes", novasAutorizacoes);
  }

  function revogarAutorizacao(alunoId) {
    const novasAutorizacoes = autorizacoes.map((item) =>
      Number(item.alunoId) === Number(alunoId)
        ? {
            ...item,
            status: "revogada",
            revokedAt: new Date().toISOString(),
          }
        : item
    );

    setAutorizacoes(novasAutorizacoes);
    persist("minervaAutorizacoes", novasAutorizacoes);
  }

  const autorizacoesRecentes = [...autorizacoes]
    .sort((a, b) => {
      const dataA =
        a.authorizedAt ||
        a.createdAt ||
        a.revokedAt ||
        "";

      const dataB =
        b.authorizedAt ||
        b.createdAt ||
        b.revokedAt ||
        "";

      return new Date(dataB) - new Date(dataA);
    })
    .slice(0, 10);

  return (
    <main className="admin-content admin-autorizacoes">
      <section className="admin-welcome">
        <p className="admin-label">
          AUTORIZAÇÕES
        </p>

        <h1>
          Autorizações
        </h1>

        <p className="admin-description">
          Gerencie quais alunos estão autorizados a participar das aulas presenciais do Minerva.
        </p>
      </section>

      <section className="admin-grid">
        <div className="admin-card">
          <span>AUTORIZAÇÕES ATIVAS</span>

          <h2>
            {autorizacoesAtivas.length}
          </h2>

          <p>
            Alunos autorizados atualmente.
          </p>
        </div>

        <div className="admin-card">
          <span>PENDENTES</span>

          <h2>
            {autorizacoesPendentes.length}
          </h2>

          <p>
            Solicitações que precisam ser verificadas.
          </p>
        </div>

        <div className="admin-card">
          <span>ALUNOS ATIVOS</span>

          <h2>
            {alunos.length}
          </h2>

          <p>
            Alunos com cadastro ativo no Minerva.
          </p>
        </div>
      </section>

      <section className="admin-section">
        <div className="section-header">
          <h2>
            Alunos
          </h2>
        </div>

        {alunos.length === 0 ? (
          <div className="admin-empty">
            <p>
              Nenhum aluno ativo encontrado.
            </p>
          </div>
        ) : (
          <ul className="admin-list">
            {alunos.map((aluno) => {
              const autorizacao = getAutorizacao(aluno.id);

              return (
                <li key={aluno.id}>
                  <div>
                    <span>
                      {autorizacao?.status === "ativo"
                        ? "AUTORIZADO"
                        : autorizacao?.status === "pendente"
                        ? "PENDENTE"
                        : "SEM AUTORIZAÇÃO"}
                    </span>

                    <p>
                      {aluno.name}
                    </p>

                    <small>
                      {aluno.email}
                    </small>
                  </div>

                  <div className="admin-actions">
                    {autorizacao?.status === "ativo" ? (
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() =>
                          revogarAutorizacao(aluno.id)
                        }
                      >
                        Revogar
                      </button>
                    ) : autorizacao?.status === "pendente" ? (
                      <>
                        <button
                          type="button"
                          className="primary-button"
                          onClick={() =>
                            autorizarAluno(aluno)
                          }
                        >
                          Autorizar
                        </button>

                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() =>
                            revogarAutorizacao(aluno.id)
                          }
                        >
                          Recusar
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="primary-button"
                        onClick={() =>
                          autorizarAluno(aluno)
                        }
                      >
                        Autorizar
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="admin-section">
        <div className="section-header">
          <h2>
            Autorizações recentes
          </h2>
        </div>

        {autorizacoesRecentes.length === 0 ? (
          <div className="admin-empty">
            <p>
              Ainda não há autorizações registradas.
            </p>
          </div>
        ) : (
          <ul className="admin-list">
            {autorizacoesRecentes.map((autorizacao) => (
              <li key={autorizacao.id}>
                <div>
                  <span>
                    {autorizacao.status === "ativo"
                      ? "AUTORIZADO"
                      : autorizacao.status === "pendente"
                      ? "PENDENTE"
                      : "REVOGADO"}
                  </span>

                  <p>
                    {autorizacao.alunoName}
                  </p>

                  <small>
                    {autorizacao.alunoEmail}
                  </small>
                </div>

                <span>
                  {autorizacao.status === "ativo"
                    ? "Ativo"
                    : autorizacao.status === "pendente"
                    ? "Aguardando"
                    : "Revogado"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

export default AdminAutorizacoes;