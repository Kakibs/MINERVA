import { Link } from "react-router-dom";
import "./Desempenho.css";

/* ==========================================================
   LEITURA DO LOCALSTORAGE
   Só as chaves que o Minerva realmente grava.
   ========================================================== */

function readList(key) {
  try {
    const saved = localStorage.getItem(key);
    const parsed = saved ? JSON.parse(saved) : [];

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readObject(key) {
  try {
    const saved = localStorage.getItem(key);

    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}


/* ==========================================================
   FUNÇÕES AUXILIARES
   ========================================================== */

// Compara IDs como texto (os IDs do Minerva podem ser "atividade-1")
function sameId(a, b) {
  if (a === undefined || a === null || b === undefined || b === null) {
    return false;
  }

  return String(a) === String(b);
}

function belongsToStudent(item, user) {
  if (!user) {
    return false;
  }

  return sameId(item.studentId ?? item.alunoId, user.id ?? user.userId);
}

// Só conta correção que realmente tem nota.
// (Number(null) vira 0, por isso a checagem é explícita.)
function hasGrade(correction) {
  return (
    correction.grade !== null &&
    correction.grade !== undefined &&
    correction.grade !== "" &&
    Number.isFinite(Number(correction.grade))
  );
}

function average(values) {
  if (values.length === 0) {
    return null;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function formatGrade(value) {
  return (
    value.toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + "/10"
  );
}

function formatDate(isoValue) {
  if (!isoValue) {
    return "";
  }

  const date = new Date(isoValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("pt-BR");
}

function plural(count, singular, pluralForm) {
  return count === 1 ? singular : pluralForm;
}

function shorten(text, max) {
  const value = String(text || "");

  return value.length > max ? value.slice(0, max).trim() + "…" : value;
}


/* ==========================================================
   PÁGINA
   ========================================================== */

function Desempenho() {
  /* ---------- Dados do aluno ---------- */

  const user = readObject("minervaLoggedUser");

  const subjects = Array.isArray(user?.subjects) ? user.subjects : [];

  const activities = readList("minervaAtividades").filter((item) =>
    subjects.includes(item.subject)
  );

  const deliveries = readList("minervaEntregas").filter((item) =>
    belongsToStudent(item, user)
  );

  const activityCorrections = readList("minervaCorrecoes").filter((item) =>
    belongsToStudent(item, user)
  );

  const questoes = readList("minervaQuestoes");

  const answers = readList("minervaRespostasQuestoes").filter((item) =>
    belongsToStudent(item, user)
  );

  const redacoes = readList("minervaRedacoes");

  const essaySubmissions = readList("minervaEntregasRedacoes").filter(
    (item) => belongsToStudent(item, user)
  );

  const essayCorrections = readList("minervaCorrecoesRedacoes").filter(
    (item) => belongsToStudent(item, user)
  );


  /* ---------- Atividades entregues ---------- */

  const deliveredActivities = activities.filter((activity) =>
    deliveries.some((delivery) =>
      sameId(delivery.activityId ?? delivery.atividadeId, activity.id)
    )
  );


  /* ---------- Notas (atividades e redações, as duas de 0 a 10) ---------- */

  const gradedItems = [];

  activityCorrections.forEach((correction) => {
    if (!hasGrade(correction)) {
      return;
    }

    const activity = activities.find((item) =>
      sameId(item.id, correction.activityId ?? correction.atividadeId)
    );

    if (!activity) {
      return;
    }

    gradedItems.push({
      subject: activity.subject,
      grade: Number(correction.grade),
    });
  });

  essayCorrections.forEach((correction) => {
    if (!hasGrade(correction)) {
      return;
    }

    const redacao = redacoes.find((item) =>
      sameId(item.id, correction.redacaoId)
    );

    const submission = essaySubmissions.find((item) =>
      sameId(item.id, correction.submissionId)
    );

    const subject = redacao?.subject ?? submission?.subject;

    if (!subject) {
      return;
    }

    gradedItems.push({
      subject: subject,
      grade: Number(correction.grade),
    });
  });

  const overallAverage = average(gradedItems.map((item) => item.grade));

  const subjectGrades = subjects.map((subject) => {
    const grades = gradedItems
      .filter((item) => item.subject === subject)
      .map((item) => item.grade);

    return {
      subject,
      count: grades.length,
      average: average(grades),
    };
  });


  /* ---------- Questões ---------- */

  const correctAnswers = answers.filter((item) => item.isCorrect).length;

  const accuracyPercent =
    answers.length > 0
      ? Math.round((correctAnswers / answers.length) * 100)
      : null;

  // Agrupa as respostas por disciplina + assunto
  const topicMap = new Map();

  answers.forEach((answer) => {
    const key = answer.subject + "||" + answer.topic;

    const current = topicMap.get(key) || {
      subject: answer.subject,
      topic: answer.topic,
      total: 0,
      correct: 0,
    };

    current.total += 1;

    if (answer.isCorrect) {
      current.correct += 1;
    }

    topicMap.set(key, current);
  });

  // Só assuntos com pelo menos um erro, do pior para o melhor
  const topicsToReview = [...topicMap.values()]
    .map((item) => ({ ...item, wrong: item.total - item.correct }))
    .filter((item) => item.wrong > 0)
    .sort(
      (a, b) =>
        b.wrong / b.total - a.wrong / a.total || b.wrong - a.wrong
    );


  /* ---------- Histórico recente ---------- */

  const history = [];

  deliveries.forEach((delivery) => {
    history.push({
      id: "entrega-" + delivery.id,
      type: "ENTREGA",
      title: delivery.activityTitle || "Atividade entregue",
      detail: "Entregue",
      date: delivery.submittedAt,
    });
  });

  answers.forEach((answer) => {
    const questao = questoes.find((item) =>
      sameId(item.id, answer.questionId)
    );

    history.push({
      id: "resposta-" + answer.id,
      type: "QUESTÃO",
      title: questao
        ? shorten(questao.statement, 70)
        : "Questão respondida",
      detail: answer.isCorrect ? "Acertou" : "Errou",
      date: answer.answeredAt,
    });
  });

  essaySubmissions.forEach((submission) => {
    history.push({
      id: "redacao-" + submission.id,
      type: "REDAÇÃO",
      title: submission.redacaoTitle || "Redação enviada",
      detail: "Enviada",
      date: submission.submittedAt,
    });
  });

  activityCorrections.forEach((correction) => {
    const activity = activities.find((item) =>
      sameId(item.id, correction.activityId ?? correction.atividadeId)
    );

    if (!activity) {
      return;
    }

    history.push({
      id: "correcao-" + (correction.id || activity.id),
      type: "CORREÇÃO",
      title: activity.title || "Atividade corrigida",
      detail: hasGrade(correction)
        ? "Nota " + formatGrade(Number(correction.grade))
        : "Com comentário",
      date: correction.correctedAt,
    });
  });

  essayCorrections.forEach((correction) => {
    const submission = essaySubmissions.find((item) =>
      sameId(item.id, correction.submissionId)
    );

    history.push({
      id: "correcao-redacao-" + (correction.id || correction.submissionId),
      type: "CORREÇÃO",
      title: submission?.redacaoTitle || "Redação corrigida",
      detail: hasGrade(correction)
        ? "Nota " + formatGrade(Number(correction.grade))
        : "Com comentário",
      date: correction.correctedAt,
    });
  });

  const recentHistory = history
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
    .slice(0, 6);

  const hasAnyRecords = history.length > 0;


  /* ==========================================================
     TELA
     ========================================================== */

  return (
    <main className="desempenho">
      <section className="desempenho-header">
        <h1>Meu desempenho</h1>

        <p>
          Acompanhe seus resultados. Tudo o que aparece aqui vem dos seus
          registros reais no Minerva.
        </p>
      </section>

      {/* ---------- Resumo ---------- */}

      <section className="desempenho-resumo">
        <div className="desempenho-card">
          <span>Média das notas</span>

          <strong>
            {overallAverage !== null ? formatGrade(overallAverage) : "Sem dados"}
          </strong>

          <small>
            {gradedItems.length > 0
              ? gradedItems.length +
                " " +
                plural(gradedItems.length, "correção", "correções") +
                " com nota"
              : "Ainda não há correções com nota"}
          </small>
        </div>

        <div className="desempenho-card">
          <span>Atividades entregues</span>

          <strong>
            {activities.length > 0
              ? deliveredActivities.length + " de " + activities.length
              : "Sem dados"}
          </strong>

          <small>
            {activities.length > 0
              ? activities.length -
                deliveredActivities.length +
                " " +
                plural(
                  activities.length - deliveredActivities.length,
                  "pendente",
                  "pendentes"
                )
              : "Ainda não há atividades para você"}
          </small>
        </div>

        <div className="desempenho-card">
          <span>Acertos nas questões</span>

          <strong>
            {accuracyPercent !== null ? accuracyPercent + "%" : "Sem dados"}
          </strong>

          <small>
            {answers.length > 0
              ? correctAnswers +
                " de " +
                answers.length +
                " " +
                plural(answers.length, "correta", "corretas")
              : "Ainda não há questões respondidas"}
          </small>
        </div>

        <div className="desempenho-card">
          <span>Redações enviadas</span>

          <strong>{essaySubmissions.length}</strong>

          <small>
            {essayCorrections.length}{" "}
            {plural(essayCorrections.length, "corrigida", "corrigidas")}
          </small>
        </div>
      </section>

      {/* ---------- Notas por disciplina ---------- */}

      <section className="desempenho-section">
        <div className="section-title">
          <h2>Notas por disciplina</h2>

          <p>Média das correções com nota, de atividades e redações.</p>
        </div>

        {subjectGrades.length === 0 ? (
          <p className="section-title">
            <span style={{ color: "#94a3b8", fontSize: 14 }}>
              Você ainda não tem disciplinas vinculadas.
            </span>
          </p>
        ) : (
          <div className="materias-list">
            {subjectGrades.map((item) => (
              <div className="materia" key={item.subject}>
                <div className="materia-info">
                  <span>{item.subject}</span>

                  <strong>
                    {item.average !== null
                      ? formatGrade(item.average) +
                        " • " +
                        item.count +
                        " " +
                        plural(item.count, "correção", "correções")
                      : "Sem notas"}
                  </strong>
                </div>

                <div
                  className="progress-bar"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={10}
                  aria-valuenow={item.average !== null ? item.average : 0}
                  aria-label={"Média em " + item.subject}
                >
                  <div
                    className="progress-fill"
                    style={{
                      width:
                        item.average !== null ? item.average * 10 + "%" : "0%",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ---------- Pontos para revisar ---------- */}

      <section className="desempenho-section">
        <div className="section-title">
          <h2>Pontos para revisar</h2>

          <p>Assuntos em que você errou questões.</p>
        </div>

        {answers.length === 0 ? (
          <p style={{ margin: 0, color: "#94a3b8", fontSize: 14 }}>
            Ainda não há dados suficientes. Responda questões para ver aqui
            os assuntos que merecem revisão.
          </p>
        ) : topicsToReview.length === 0 ? (
          <p style={{ margin: 0, color: "#94a3b8", fontSize: 14 }}>
            Nenhum erro registrado nas questões respondidas.
          </p>
        ) : (
          <div className="revisao-list">
            {topicsToReview.map((item) => (
              <div className="revisao-card" key={item.subject + item.topic}>
                <div>
                  <h3>{item.topic}</h3>

                  <p>
                    {item.subject} • {item.correct} de {item.total}{" "}
                    {plural(item.total, "correta", "corretas")}
                  </p>
                </div>

                <span>
                  {item.wrong} {plural(item.wrong, "erro", "erros")}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ---------- Histórico recente ---------- */}

      <section className="performance-section">
        <div className="section-header">
          <h2>Atividade recente</h2>

          <Link to="/atividades">Ver atividades →</Link>
        </div>

        {!hasAnyRecords ? (
          <p style={{ margin: 0, color: "#94a3b8", fontSize: 14 }}>
            Ainda não há registros. Quando você entregar atividades, responder
            questões ou enviar redações, eles aparecem aqui.
          </p>
        ) : (
          <ul className="performance-list">
            {recentHistory.map((item) => (
              <li key={item.id}>
                <div>
                  <span>{item.type}</span>

                  <p>{item.title}</p>
                </div>

                <p>
                  {item.detail}
                  {formatDate(item.date) ? " • " + formatDate(item.date) : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

export default Desempenho;