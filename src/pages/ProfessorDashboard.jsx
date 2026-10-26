import { useState } from "react";
import { Link } from "react-router-dom";
import "./ProfessorDashboard.css";
// ==========================================
// LEITURA SEGURA DO LOCALSTORAGE
// ==========================================

function readList(key) {
  try {
    const saved = localStorage.getItem(key);
    const parsed = saved ? JSON.parse(saved) : [];

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readUser() {
  try {
    return JSON.parse(
      localStorage.getItem("minervaLoggedUser") || "null"
    );
  } catch {
    return null;
  }
}

// ==========================================
// DATA
// ==========================================

function formatDate(date) {
  if (!date) {
    return "Data não registrada";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Data não registrada";
  }

  return parsedDate.toLocaleDateString("pt-BR");
}

// ==========================================
// DASHBOARD
// ==========================================

function ProfessorDashboard() {
  const [users] = useState(() =>
    readList("minervaUsers")
  );

  const [activities] = useState(() =>
    readList("minervaAtividades")
  );

  const [submissions] = useState(() =>
    readList("minervaEntregas")
  );

  const [corrections] = useState(() =>
    readList("minervaCorrecoes")
  );

  const [questions] = useState(() =>
    readList("minervaQuestoes")
  );

  const [questionAnswers] = useState(() =>
    readList("minervaRespostasQuestoes")
  );

  const [redacoes] = useState(() =>
    readList("minervaRedacoes")
  );

  const [redacaoSubmissions] = useState(() =>
    readList("minervaEntregasRedacoes")
  );

  const [redacaoCorrections] = useState(() =>
    readList("minervaCorrecoesRedacoes")
  );

  const [simulados] = useState(() =>
    readList("minervaSimulados")
  );

  const [simuladoResponses] = useState(() =>
    readList("minervaRespostasSimulados")
  );

  const [professor] = useState(() =>
    readUser()
  );

  // ==========================================
  // PROFESSOR
  // ==========================================

  const professorSubjects =
    professor?.subjects || [];

  // ==========================================
  // ALUNOS ATIVOS
  // ==========================================

  const activeStudents = users.filter(
    (user) =>
      user.userType === "aluno" &&
      user.status === "ativo"
  );

  const professorStudents =
    activeStudents.filter((student) =>
      (student.subjects || []).some(
        (subject) =>
          professorSubjects.includes(subject)
      )
    );

  // ==========================================
  // ATIVIDADES
  // ==========================================

  const professorActivities =
    activities.filter(
      (activity) =>
        String(activity.professorId) ===
        String(professor?.id)
    );

  const professorSubmissions =
    submissions.filter((submission) =>
      professorActivities.some(
        (activity) =>
          activity.id ===
          submission.activityId
      )
    );

  const professorCorrections =
    corrections.filter((correction) =>
      professorSubmissions.some(
        (submission) =>
          submission.id ===
          correction.submissionId
      )
    );

  const pendingSubmissions =
    professorSubmissions.filter(
      (submission) =>
        !professorCorrections.some(
          (correction) =>
            correction.submissionId ===
            submission.id
        )
    );

  // ==========================================
  // QUESTÕES
  // ==========================================

  const professorQuestions =
    questions.filter(
      (question) =>
        question.professorId ===
          professor?.id ||
        (
          !question.professorId &&
          professorSubjects.includes(
            question.subject
          )
        )
    );

  const professorQuestionAnswers =
    questionAnswers.filter((answer) =>
      professorQuestions.some(
        (question) =>
          question.id ===
          answer.questionId
      )
    );

  let questionCorrect = 0;
  let questionTotal = 0;

  professorQuestionAnswers.forEach(
    (answer) => {
      questionTotal += 1;

      if (answer.isCorrect) {
        questionCorrect += 1;
      }
    }
  );

  const questionAccuracy =
    questionTotal > 0
      ? Math.round(
          (questionCorrect /
            questionTotal) *
            100
        )
      : null;

  // ==========================================
  // REDAÇÕES
  // ==========================================

  const professorRedacoes =
    redacoes.filter(
      (redacao) =>
        redacao.professorId ===
          professor?.id ||
        (
          !redacao.professorId &&
          professorSubjects.includes(
            redacao.subject
          )
        )
    );

  const professorRedacaoSubmissions =
    redacaoSubmissions.filter(
      (submission) =>
        professorRedacoes.some(
          (redacao) =>
            redacao.id ===
            submission.redacaoId
        )
    );

  const professorRedacaoCorrections =
    redacaoCorrections.filter(
      (correction) =>
        professorRedacaoSubmissions.some(
          (submission) =>
            submission.id ===
            correction.submissionId
        )
    );

  const pendingRedacoes =
    professorRedacaoSubmissions.filter(
      (submission) =>
        !professorRedacaoCorrections.some(
          (correction) =>
            correction.submissionId ===
            submission.id
        )
    );

  // ==========================================
  // SIMULADOS
  // ==========================================

  const professorSimulados =
    simulados.filter(
      (simulado) =>
        simulado.professorId ===
          professor?.id ||
        (
          !simulado.professorId &&
          professorSubjects.includes(
            simulado.subject
          )
        )
    );

  const professorSimuladoResponses =
    simuladoResponses.filter(
      (response) =>
        professorSimulados.some(
          (simulado) =>
            simulado.id ===
            response.simuladoId
        )
    );

  let simuladoQuestions = 0;
  let simuladoCorrect = 0;

  professorSimuladoResponses.forEach(
    (response) => {
      simuladoQuestions +=
        Number(
          response.totalQuestions
        ) || 0;

      simuladoCorrect +=
        Number(
          response.correctAnswers
        ) || 0;
    }
  );

  const simuladoAccuracy =
    simuladoQuestions > 0
      ? Math.round(
          (simuladoCorrect /
            simuladoQuestions) *
            100
        )
      : null;

  // ==========================================
  // ATIVIDADE MAIS RECENTE
  // ==========================================

  const recentItems = [
    ...professorActivities.map(
      (activity) => ({
        type: "ATIVIDADE",
        title: activity.title,
        date: activity.createdAt,
      })
    ),

    ...professorSubmissions.map(
      (submission) => ({
        type: "ENTREGA",
        title:
          submission.activityTitle ||
          "Nova entrega",
        date: submission.submittedAt,
      })
    ),

    ...professorRedacaoSubmissions.map(
      (submission) => ({
        type: "REDAÇÃO",
        title:
          submission.redacaoTitle ||
          "Nova redação enviada",
        date: submission.submittedAt,
      })
    ),

    ...professorSimuladoResponses.map(
      (response) => ({
        type: "SIMULADO",
        title:
          response.simuladoTitle ||
          "Simulado realizado",
        date: response.finishedAt,
      })
    ),
  ]
    .filter((item) => item.date)
    .sort(
      (a, b) =>
        new Date(b.date) -
        new Date(a.date)
    )
    .slice(0, 5);

  return (
    <main className="professor-content">

      {/* ======================================
          CABEÇALHO
      ====================================== */}

      <section className="professor-welcome">

        <p className="professor-label">
          ÁREA DO PROFESSOR
        </p>

        <h1>
          Bem-vindo ao Minerva
          {professor?.name
            ? `, ${professor.name}`
            : ""}
        </h1>

        <p className="professor-description">
          Acompanhe suas turmas, atividades,
          avaliações e o desempenho real dos alunos.
        </p>

      </section>

      {/* ======================================
          VISÃO GERAL
      ====================================== */}

      <section className="professor-grid">

        <Link
          to="/professor/turmas"
          className="professor-card professor-card-link"
        >
          <span>
            ALUNOS ATIVOS
          </span>

          <h2>
            {professorStudents.length > 0
              ? professorStudents.length
              : "Sem dados"}
          </h2>

          <p>
            {professorStudents.length > 0
              ? "Alunos vinculados às suas disciplinas."
              : "Ainda não há alunos ativos vinculados."}
          </p>

          <small>
            Acessar turmas →
          </small>
        </Link>

        <Link
          to="/professor/atividades"
          className="professor-card professor-card-link"
        >
          <span>
            ATIVIDADES
          </span>

          <h2>
            {professorActivities.length > 0
              ? professorActivities.length
              : "Sem dados"}
          </h2>

          <p>
            Atividades criadas por você.
          </p>

          <small>
            Acessar atividades →
          </small>
        </Link>

        <Link
          to="/professor/questoes"
          className="professor-card professor-card-link"
        >
          <span>
            QUESTÕES
          </span>

          <h2>
            {professorQuestions.length > 0
              ? professorQuestions.length
              : "Sem dados"}
          </h2>

          <p>
            Questões disponíveis nas suas disciplinas.
          </p>

          <small>
            Acessar questões →
          </small>
        </Link>

        <Link
          to="/professor/simulados"
          className="professor-card professor-card-link"
        >
          <span>
            SIMULADOS
          </span>

          <h2>
            {professorSimulados.length > 0
              ? professorSimulados.length
              : "Sem dados"}
          </h2>

          <p>
            Simulados criados por você.
          </p>

          <small>
            Acessar simulados →
          </small>
        </Link>

      </section>

      {/* ======================================
          PENDÊNCIAS
      ====================================== */}

      <section className="professor-section">

        <div className="section-header">

          <div>

            <h2>
              Pendências
            </h2>

            <p>
              Entregas que precisam da sua atenção.
            </p>

          </div>

        </div>

        <section className="professor-grid">

          <Link
            to="/professor/atividades"
            className="professor-card professor-card-link"
          >

            <span>
              ATIVIDADES
            </span>

            <h2>
              {pendingSubmissions.length > 0
                ? pendingSubmissions.length
                : "Sem dados"}
            </h2>

            <p>
              {pendingSubmissions.length > 0
                ? "Entregas aguardando correção."
                : "Nenhuma entrega aguardando correção."}
            </p>

            <small>
              Ver atividades →
            </small>

          </Link>

          <Link
            to="/professor/redacoes"
            className="professor-card professor-card-link"
          >

            <span>
              REDAÇÕES
            </span>

            <h2>
              {pendingRedacoes.length > 0
                ? pendingRedacoes.length
                : "Sem dados"}
            </h2>

            <p>
              {pendingRedacoes.length > 0
                ? "Redações aguardando correção."
                : "Nenhuma redação aguardando correção."}
            </p>

            <small>
              Ver redações →
            </small>

          </Link>

        </section>

      </section>

      {/* ======================================
          DESEMPENHO
      ====================================== */}

      <section className="professor-section">

        <div className="section-header">

          <div>

            <h2>
              Desempenho
            </h2>

            <p>
              Indicadores calculados a partir
              das respostas reais registradas.
            </p>

          </div>

        </div>

        <section className="professor-grid">

          <Link
            to="/professor/desempenho"
            className="professor-card professor-card-link"
          >

            <span>
              QUESTÕES
            </span>

            <h2>
              {questionAccuracy === null
                ? "Sem dados"
                : `${questionAccuracy}%`}
            </h2>

            <p>
              {questionAccuracy === null
                ? "Ainda não há respostas registradas."
                : "Aproveitamento nas questões respondidas."}
            </p>

            <small>
              Ver desempenho →
            </small>

          </Link>

          <Link
            to="/professor/desempenho"
            className="professor-card professor-card-link"
          >

            <span>
              SIMULADOS
            </span>

            <h2>
              {simuladoAccuracy === null
                ? "Sem dados"
                : `${simuladoAccuracy}%`}
            </h2>

            <p>
              {simuladoAccuracy === null
                ? "Ainda não há resultados de simulados."
                : "Aproveitamento médio nos simulados realizados."}
            </p>

            <small>
              Ver desempenho →
            </small>

          </Link>

          <Link
            to="/professor/redacoes"
            className="professor-card professor-card-link"
          >

            <span>
              REDAÇÕES CORRIGIDAS
            </span>

            <h2>
              {professorRedacaoCorrections.length >
              0
                ? professorRedacaoCorrections.length
                : "Sem dados"}
            </h2>

            <p>
              Correções registradas no sistema.
            </p>

            <small>
              Ver redações →
            </small>

          </Link>

        </section>

      </section>

      {/* ======================================
          DISCIPLINAS
      ====================================== */}

      <section className="professor-section">

        <div className="section-header">

          <div>

            <h2>
              Suas disciplinas
            </h2>

            <p>
              Disciplinas vinculadas ao seu perfil.
            </p>

          </div>

        </div>

        {professorSubjects.length === 0 ? (

          <div className="professor-empty-state">

            <h3>
              Nenhuma disciplina vinculada
            </h3>

            <p>
              Ainda não existem disciplinas
              vinculadas ao professor.
            </p>

          </div>

        ) : (

          <ul className="professor-list">

            {professorSubjects.map(
              (subject) => {

                const subjectStudents =
                  professorStudents.filter(
                    (student) =>
                      (
                        student.subjects ||
                        []
                      ).includes(subject)
                  );

                const subjectQuestions =
                  professorQuestions.filter(
                    (question) =>
                      question.subject ===
                      subject
                  );

                const subjectActivities =
                  professorActivities.filter(
                    (activity) =>
                      activity.subject ===
                      subject
                  );

                const subjectSimulados =
                  professorSimulados.filter(
                    (simulado) =>
                      simulado.subject ===
                      subject
                  );

                return (
                  <li
                    key={subject}
                  >

                    <div>

                      <span>
                        DISCIPLINA
                      </span>

                      <p>
                        {subject}
                      </p>

                    </div>

                    <span>
                      {subjectStudents.length}{" "}
                      {subjectStudents.length === 1
                        ? "aluno"
                        : "alunos"}
                    </span>

                    <span>
                      {subjectQuestions.length}{" "}
                      {subjectQuestions.length === 1
                        ? "questão"
                        : "questões"}
                    </span>

                    <span>
                      {subjectActivities.length}{" "}
                      {subjectActivities.length === 1
                        ? "atividade"
                        : "atividades"}
                    </span>

                    <span>
                      {subjectSimulados.length}{" "}
                      {subjectSimulados.length === 1
                        ? "simulado"
                        : "simulados"}
                    </span>

                  </li>
                );
              }
            )}

          </ul>

        )}

      </section>

      {/* ======================================
          ATIVIDADE RECENTE
      ====================================== */}

      <section className="professor-section">

        <div className="section-header">

          <div>

            <h2>
              Atividade recente
            </h2>

            <p>
              Últimas ações registradas no Minerva.
            </p>

          </div>

        </div>

        {recentItems.length === 0 ? (

          <div className="professor-empty-state">

            <h3>
              Nenhuma atividade recente
            </h3>

            <p>
              As ações aparecerão aqui conforme
              os alunos e professores utilizarem
              o sistema.
            </p>

          </div>

        ) : (

          <ul className="professor-list">

            {recentItems.map(
              (item, index) => (

                <li
                  key={`${item.type}-${item.title}-${index}`}
                >

                  <div>

                    <span>
                      {item.type}
                    </span>

                    <p>
                      {item.title}
                    </p>

                    <small>
                      {formatDate(item.date)}
                    </small>

                  </div>

                </li>

              )
            )}

          </ul>

        )}

      </section>

    </main>
  );
}

export default ProfessorDashboard;