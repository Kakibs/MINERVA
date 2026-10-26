import { Link } from "react-router-dom";
import "./Dashboard.css";

/* ==========================================================
   REGRAS DE XP E NÍVEL
   Tudo é calculado a partir de registros reais do localStorage.
   Para mudar uma regra, altere só os números abaixo.
   ========================================================== */

const XP_RULES = {
  activity: 10, // por atividade entregue
  question: 5, // por questão respondida
  essay: 15, // por redação enviada
};

const XP_PER_LEVEL = 100;


/* ==========================================================
   LEITURA DO LOCALSTORAGE
   ========================================================== */

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

function readObject(key) {
  try {
    const saved = localStorage.getItem(key);

    if (!saved) {
      return null;
    }

    return JSON.parse(saved);
  } catch {
    return null;
  }
}


/* ==========================================================
   FUNÇÕES AUXILIARES
   ========================================================== */

// Compara IDs como texto. Os IDs do Minerva podem ser texto
// ("atividade-1"), então comparar com Number() sempre falha.
function sameId(a, b) {
  if (a === undefined || a === null || b === undefined || b === null) {
    return false;
  }

  return String(a) === String(b);
}

function belongsToStudent(item, student) {
  if (!student) {
    return false;
  }

  return sameId(
    item.studentId ?? item.alunoId,
    student.id ?? student.userId
  );
}

function createDate(date, time = "00:00") {
  if (!date) {
    return null;
  }

  const value = new Date(`${date}T${time || "00:00"}`);

  if (Number.isNaN(value.getTime())) {
    return null;
  }

  return value;
}

function startOfToday() {
  const today = new Date();

  return new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
}

function formatDate(dateValue) {
  if (!dateValue) {
    return "";
  }

  const parts = dateValue.split("-");

  if (parts.length !== 3) {
    return dateValue;
  }

  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

// Quantos dias faltam até a data (0 = hoje, 1 = amanhã, -1 = ontem)
function daysUntil(dateValue) {
  if (!dateValue) {
    return null;
  }

  const [year, month, day] = String(dateValue).split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  const target = new Date(year, month - 1, day);

  return Math.round((target - startOfToday()) / (1000 * 60 * 60 * 24));
}

function getRelativeDate(dateValue) {
  const difference = daysUntil(dateValue);

  if (difference === null) {
    return "";
  }

  if (difference === 0) {
    return "Hoje";
  }

  if (difference === 1) {
    return "Amanhã";
  }

  if (difference === -1) {
    return "Ontem";
  }

  return formatDate(dateValue);
}

// Converte uma data ISO (UTC) para a data local do aluno: "AAAA-MM-DD"
function isoToLocalDate(isoValue) {
  if (!isoValue) {
    return "";
  }

  const date = new Date(isoValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${date.getFullYear()}-${month}-${day}`;
}

function formatGrade(value) {
  return String(value).replace(".", ",") + "/10";
}

function plural(count, singular, pluralForm) {
  return count === 1 ? singular : pluralForm;
}

function getActivityDate(activity) {
  return activity.deadline || activity.date || null;
}

function getActivityTitle(activity) {
  return activity.title || activity.name || "Atividade";
}


/* ==========================================================
   ÍCONES (SVG escritos à mão, sem biblioteca)
   ========================================================== */

const ICONS = {
  calendar:
    "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
  clipboard:
    "M9 4h6a1 1 0 0 1 1 1v1H8V5a1 1 0 0 1 1-1zM8 6H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-2M9 13h6M9 17h4",
  checkCircle: "M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3",
  target:
    "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  trophy:
    "M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4zM17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3",
  bell: "M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0",
  arrow: "M5 12h14M13 6l6 6-6 6",
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  pencil:
    "M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z",
  question:
    "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01",
  book: "M4 5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2V5z",
};

function Icon({ name }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={ICONS[name]} />
    </svg>
  );
}

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


/* ==========================================================
   PÁGINA
   ========================================================== */

function Dashboard() {
  /* ---------- Dados salvos ---------- */

  const loggedUser = readObject("minervaLoggedUser");

  const cronograma = readList("minervaCronograma");
  const atividades = readList("minervaAtividades");
  const entregas = readList("minervaEntregas");
  const correcoes = readList("minervaCorrecoes");
  const respostasQuestoes = readList("minervaRespostasQuestoes");
  const entregasRedacoes = readList("minervaEntregasRedacoes");

  const studentSubjects = Array.isArray(loggedUser?.subjects)
    ? loggedUser.subjects
    : [];

  const firstName =
    String(loggedUser?.name || "").trim().split(" ")[0] || "aluno";


  /* ---------- Próxima aula ---------- */

  const now = new Date();

  const nextClass = cronograma
    .filter((item) => studentSubjects.includes(item.subject))
    .filter((item) => createDate(item.date, item.time))
    .sort(
      (a, b) =>
        createDate(a.date, a.time) - createDate(b.date, b.time)
    )
    .find((item) => createDate(item.date, item.time) >= now);


  /* ---------- Atividades do aluno ---------- */

  const studentActivities = atividades
    .filter((item) => studentSubjects.includes(item.subject))
    .sort((a, b) => {
      const dateA = createDate(getActivityDate(a));
      const dateB = createDate(getActivityDate(b));

      if (!dateA && !dateB) {
        return 0;
      }

      if (!dateA) {
        return 1;
      }

      if (!dateB) {
        return -1;
      }

      return dateA - dateB;
    });

  const studentDeliveries = entregas.filter((item) =>
    belongsToStudent(item, loggedUser)
  );

  function isDelivered(activity) {
    return studentDeliveries.some((delivery) =>
      sameId(delivery.activityId ?? delivery.atividadeId, activity.id)
    );
  }

  const pendingActivities = studentActivities.filter(
    (activity) => !isDelivered(activity)
  );

  const todayStart = startOfToday();

  const overdueActivities = pendingActivities.filter((activity) => {
    const deadline = createDate(getActivityDate(activity));

    return deadline && deadline < todayStart;
  });

  // Ainda dá tempo de entregar (ou não tem prazo)
  const upcomingActivities = pendingActivities.filter((activity) => {
    const deadline = createDate(getActivityDate(activity));

    return !deadline || deadline >= todayStart;
  });

  const deliveredCount = studentActivities.filter(isDelivered).length;


  /* ---------- Correções do aluno (mais recentes primeiro) ---------- */

  const recentCorrections = correcoes
    .filter((item) => belongsToStudent(item, loggedUser))
    .map((correction) => ({
      correction,
      activity: studentActivities.find((activity) =>
        sameId(activity.id, correction.activityId ?? correction.atividadeId)
      ),
    }))
    .filter((item) => item.activity)
    .sort(
      (a, b) =>
        new Date(b.correction.correctedAt || 0) -
        new Date(a.correction.correctedAt || 0)
    );


  /* ---------- XP, nível e conquistas (derivados de registros reais) ---------- */

  const studentAnswers = respostasQuestoes.filter((item) =>
    belongsToStudent(item, loggedUser)
  );

  const studentEssays = entregasRedacoes.filter((item) =>
    belongsToStudent(item, loggedUser)
  );

  const xpBreakdown = [
    {
      label: plural(
        studentDeliveries.length,
        "atividade entregue",
        "atividades entregues"
      ),
      count: studentDeliveries.length,
      xp: studentDeliveries.length * XP_RULES.activity,
    },
    {
      label: plural(
        studentAnswers.length,
        "questão respondida",
        "questões respondidas"
      ),
      count: studentAnswers.length,
      xp: studentAnswers.length * XP_RULES.question,
    },
    {
      label: plural(
        studentEssays.length,
        "redação enviada",
        "redações enviadas"
      ),
      count: studentEssays.length,
      xp: studentEssays.length * XP_RULES.essay,
    },
  ];

  const totalXp = xpBreakdown.reduce((sum, item) => sum + item.xp, 0);

  const level = Math.floor(totalXp / XP_PER_LEVEL) + 1;
  const xpInLevel = totalXp % XP_PER_LEVEL;
  const levelPercent = (xpInLevel / XP_PER_LEVEL) * 100;

  const achievements = [
    {
      id: "first-activity",
      icon: "star",
      title: "Primeira atividade entregue",
      unlocked: studentDeliveries.length > 0,
    },
    {
      id: "first-question",
      icon: "question",
      title: "Primeira questão respondida",
      unlocked: studentAnswers.length > 0,
    },
    {
      id: "first-essay",
      icon: "pencil",
      title: "Primeira redação enviada",
      unlocked: studentEssays.length > 0,
    },
    {
      id: "first-correction",
      icon: "checkCircle",
      title: "Primeira correção recebida",
      unlocked: recentCorrections.length > 0,
    },
  ];

  const unlockedCount = achievements.filter((item) => item.unlocked).length;

  // Anel de progresso do nível
  const ringRadius = 44;
  const ringLength = 2 * Math.PI * ringRadius;


  /* ---------- Jornada por disciplina ---------- */

  const journey = studentSubjects.map((subject) => {
    const subjectActivities = studentActivities.filter(
      (activity) => activity.subject === subject
    );

    const delivered = subjectActivities.filter(isDelivered).length;

    return {
      subject,
      total: subjectActivities.length,
      delivered,
      percent:
        subjectActivities.length > 0
          ? Math.round((delivered / subjectActivities.length) * 100)
          : 0,
    };
  });


  /* ---------- Lembretes (só o que realmente exige atenção) ---------- */

  const reminders = [];

  if (nextClass) {
    const days = daysUntil(nextClass.date);

    if (days !== null && days <= 1) {
      reminders.push({
        id: "class-" + nextClass.date + "-" + nextClass.time,
        icon: "calendar",
        title: "Aula de " + nextClass.subject,
        text:
          getRelativeDate(nextClass.date) +
          (nextClass.time ? " • " + nextClass.time : "") +
          (nextClass.room ? " • Sala " + nextClass.room : ""),
        to: "/cronograma",
      });
    }
  }

  pendingActivities.forEach((activity) => {
    const deadline = getActivityDate(activity);
    const days = daysUntil(deadline);

    if (days === null || days > 1) {
      return;
    }

    reminders.push({
      id: "activity-" + activity.id,
      icon: "clipboard",
      title: getActivityTitle(activity),
      text:
        days < 0
          ? "Prazo vencido em " + formatDate(deadline)
          : "Prazo: " + getRelativeDate(deadline),
      to: "/atividades",
    });
  });

  const visibleReminders = reminders.slice(0, 4);


  /* ---------- Resumo final ---------- */

  const summaryTitle =
    studentActivities.length === 0
      ? "Ainda não há atividades para você"
      : `Você entregou ${deliveredCount} de ${studentActivities.length} ${plural(
          studentActivities.length,
          "atividade",
          "atividades"
        )}`;

  const summaryText =
    studentActivities.length === 0
      ? "Quando seus professores criarem atividades, sua evolução aparecerá aqui."
      : "Veja seus resultados e dificuldades na página de Desempenho.";


  /* ==========================================================
     TELA
     ========================================================== */

  return (
    <main className="dash">
      <header className="dash-greeting">
        <h1>Olá, {firstName}!</h1>

        <p>Que bom ter você aqui no Minerva.</p>
      </header>

      <div className="dash-layout">
        {/* ================= COLUNA PRINCIPAL ================= */}

        <div className="dash-primary">
          {/* ---------- Banner de progresso ---------- */}

          <section className="dash-banner" aria-label="Seu progresso">
            <div className="dash-banner-progress">
              <span className="dash-chip">SEU PROGRESSO</span>

              <strong>Nível {level}</strong>

              <div
                className="dash-bar"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={XP_PER_LEVEL}
                aria-valuenow={xpInLevel}
                aria-label="XP do nível atual"
              >
                <div
                  className="dash-bar-fill"
                  style={{ width: levelPercent + "%" }}
                />
              </div>

              <span className="dash-banner-xp">
                {xpInLevel} / {XP_PER_LEVEL} XP
              </span>
            </div>

            <h2>
              {totalXp > 0 ? "Continue evoluindo," : "Comece sua jornada,"}
              <span> {firstName}!</span>
            </h2>

            <p>
              {totalXp > 0
                ? "Cada aula, cada atividade, cada conquista te aproxima dos seus objetivos."
                : "Entregue sua primeira atividade ou responda uma questão para ganhar seus primeiros pontos de XP."}
            </p>
          </section>

          {/* ---------- Quatro cartões de resumo ---------- */}

          <section className="dash-cards" aria-label="Resumo">
            <article className="dash-card">
              <div className="dash-card-head">
                <span className="dash-icon dash-icon-blue">
                  <Icon name="calendar" />
                </span>

                <div>
                  <span className="dash-card-label">Próxima aula</span>

                  <strong className="dash-card-title">
                    {nextClass ? nextClass.subject : "Nenhuma aula agendada"}
                  </strong>
                </div>
              </div>

              {nextClass ? (
                <p className="dash-card-text">
                  {getRelativeDate(nextClass.date)}
                  {nextClass.time ? " • " + nextClass.time : ""}
                  {nextClass.room ? " • Sala " + nextClass.room : ""}
                </p>
              ) : (
                <p className="dash-card-text">
                  Ainda não há aulas cadastradas para as suas disciplinas.
                </p>
              )}

              <Link to="/cronograma" className="dash-card-link">
                Ver no cronograma
                <Icon name="arrow" />
              </Link>
            </article>

            <article className="dash-card">
              <div className="dash-card-head">
                <span className="dash-icon dash-icon-indigo">
                  <Icon name="clipboard" />
                </span>

                <span className="dash-card-label">
                  {plural(
                    pendingActivities.length,
                    "Atividade pendente",
                    "Atividades pendentes"
                  )}
                </span>
              </div>

              <strong className="dash-card-number">
                {pendingActivities.length}
              </strong>

              {overdueActivities.length > 0 && (
                <p className="dash-card-text dash-warning">
                  {overdueActivities.length}{" "}
                  {plural(
                    overdueActivities.length,
                    "com prazo vencido",
                    "com prazo vencido"
                  )}
                </p>
              )}

              <Link to="/atividades" className="dash-card-link">
                Ver todas
                <Icon name="arrow" />
              </Link>
            </article>

            <article className="dash-card">
              <div className="dash-card-head">
                <span className="dash-icon dash-icon-green">
                  <Icon name="checkCircle" />
                </span>

                <span className="dash-card-label">
                  {plural(
                    recentCorrections.length,
                    "Correção recebida",
                    "Correções recebidas"
                  )}
                </span>
              </div>

              <strong className="dash-card-number">
                {recentCorrections.length}
              </strong>

              <Link to="/atividades" className="dash-card-link">
                Ver todas
                <Icon name="arrow" />
              </Link>
            </article>

            <article className="dash-card">
              <div className="dash-card-head">
                <span className="dash-icon dash-icon-cyan">
                  <Icon name="book" />
                </span>

                <span className="dash-card-label">
                  {plural(
                    upcomingActivities.length,
                    "Atividade no prazo",
                    "Atividades no prazo"
                  )}
                </span>
              </div>

              <strong className="dash-card-number">
                {upcomingActivities.length}
              </strong>

              <Link to="/atividades" className="dash-card-link">
                Ver todas
                <Icon name="arrow" />
              </Link>
            </article>
          </section>

          {/* ---------- Três painéis ---------- */}

          <section className="dash-panels">
            {/* Jornada de estudos */}

            <article className="dash-panel">
              <header className="dash-panel-header">
                <span className="dash-panel-icon">
                  <Icon name="target" />
                </span>

                <div>
                  <h3>Sua jornada de estudos</h3>

                  <p>Entregas por disciplina</p>
                </div>
              </header>

              {journey.length === 0 ? (
                <div className="dash-empty">
                  <strong>Nenhuma disciplina</strong>

                  <p>Você ainda não tem disciplinas vinculadas.</p>
                </div>
              ) : (
                <ul className="dash-journey">
                  {journey.map((item) => (
                    <li key={item.subject}>
                      <div className="dash-journey-top">
                        <strong>{item.subject}</strong>

                        {item.total > 0 && <span>{item.percent}%</span>}
                      </div>

                      {item.total > 0 ? (
                        <>
                          <div
                            className="dash-bar"
                            role="progressbar"
                            aria-valuemin={0}
                            aria-valuemax={item.total}
                            aria-valuenow={item.delivered}
                            aria-label={"Entregas de " + item.subject}
                          >
                            <div
                              className="dash-bar-fill"
                              style={{ width: item.percent + "%" }}
                            />
                          </div>

                          <small>
                            {item.delivered} de {item.total}{" "}
                            {plural(item.total, "entregue", "entregues")}
                          </small>
                        </>
                      ) : (
                        <small>Sem atividades ainda</small>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              <Link to="/desempenho" className="dash-panel-link">
                Ver desempenho
                <Icon name="arrow" />
              </Link>
            </article>

            {/* Atividades próximas */}

            <article className="dash-panel">
              <header className="dash-panel-header">
                <span className="dash-panel-icon">
                  <Icon name="calendar" />
                </span>

                <div>
                  <h3>Atividades próximas</h3>

                  <p>O que falta entregar</p>
                </div>
              </header>

              {upcomingActivities.length === 0 ? (
                <div className="dash-empty">
                  <strong>Nenhuma atividade próxima</strong>

                  <p>
                    {studentActivities.length === 0
                      ? "Quando seus professores criarem atividades, elas aparecem aqui."
                      : "Você não tem atividades a entregar no prazo."}
                  </p>
                </div>
              ) : (
                <ul className="dash-rows">
                  {upcomingActivities.slice(0, 3).map((activity) => (
                    <li key={activity.id}>
                      <Link to="/atividades" className="dash-row">
                        <span className="dash-row-body">
                          <strong>{getActivityTitle(activity)}</strong>

                          <small>
                            {activity.subject}
                            {getActivityDate(activity)
                              ? " • Prazo: " +
                                getRelativeDate(getActivityDate(activity))
                              : ""}
                          </small>
                        </span>

                        <span className="dash-row-action">Abrir</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              <Link to="/atividades" className="dash-panel-link">
                Ver todas
                <Icon name="arrow" />
              </Link>
            </article>

            {/* Correções recentes */}

            <article className="dash-panel">
              <header className="dash-panel-header">
                <span className="dash-panel-icon">
                  <Icon name="checkCircle" />
                </span>

                <div>
                  <h3>Correções recentes</h3>

                  <p>Retorno dos professores</p>
                </div>
              </header>

              {recentCorrections.length === 0 ? (
                <div className="dash-empty">
                  <strong>Ainda não há correções</strong>

                  <p>Quando uma atividade for corrigida, o resultado aparece aqui.</p>
                </div>
              ) : (
                <ul className="dash-rows">
                  {recentCorrections
                    .slice(0, 3)
                    .map(({ correction, activity }) => {
                      const hasGrade =
                        correction.grade !== null &&
                        correction.grade !== undefined &&
                        correction.grade !== "";

                      const correctedDate = isoToLocalDate(
                        correction.correctedAt
                      );

                      return (
                        <li key={correction.id || activity.id + "-correcao"}>
                          <Link to="/atividades" className="dash-row">
                            <span className="dash-row-body">
                              <strong>{getActivityTitle(activity)}</strong>

                              <small>
                                {hasGrade
                                  ? "Nota: " + formatGrade(correction.grade)
                                  : "Com comentário do professor"}
                                {correctedDate
                                  ? " • " + getRelativeDate(correctedDate)
                                  : ""}
                              </small>
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                </ul>
              )}

              <Link to="/atividades" className="dash-panel-link">
                Ver todas
                <Icon name="arrow" />
              </Link>
            </article>
          </section>

          {/* ---------- Resumo final ---------- */}

          <section className="dash-summary">
            <span className="dash-summary-icon">
              <Icon name="target" />
            </span>

            <div>
              <strong>{summaryTitle}</strong>

              <p>{summaryText}</p>
            </div>

            <Link to="/desempenho" className="dash-button">
              Ver desempenho
              <Icon name="arrow" />
            </Link>
          </section>
        </div>

        {/* ================= COLUNA LATERAL ================= */}

        <aside className="dash-side">
          {/* Nível e conquistas */}

          <section className="dash-panel">
            <div className="dash-level">
              <div className="dash-ring">
                <svg viewBox="0 0 100 100" aria-hidden="true">
                  <defs>
                    <linearGradient
                      id="dash-ring-gradient"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>

                  <circle
                    className="dash-ring-track"
                    cx="50"
                    cy="50"
                    r={ringRadius}
                  />

                  <circle
                    className="dash-ring-value"
                    cx="50"
                    cy="50"
                    r={ringRadius}
                    strokeDasharray={ringLength}
                    strokeDashoffset={
                      ringLength - (ringLength * levelPercent) / 100
                    }
                  />
                </svg>

                <span className="dash-ring-owl">
                  <OwlMark />
                </span>
              </div>

              <div>
                <span className="dash-chip">Nível {level}</span>

                <strong className="dash-level-xp">
                  {xpInLevel} / {XP_PER_LEVEL} XP
                </strong>

                <small>Total: {totalXp} XP</small>
              </div>
            </div>

            {totalXp === 0 ? (
              <p className="dash-note">
                Ainda não há atividade registrada. O XP aparece conforme você
                entrega atividades, responde questões e envia redações.
              </p>
            ) : (
              <ul className="dash-xp-list">
                {xpBreakdown
                  .filter((item) => item.count > 0)
                  .map((item) => (
                    <li key={item.label}>
                      <span>
                        {item.count} {item.label}
                      </span>

                      <strong>+{item.xp} XP</strong>
                    </li>
                  ))}
              </ul>
            )}

            <div className="dash-divider" />

            <h3 className="dash-side-title">
              Suas conquistas
              <small>
                {unlockedCount} de {achievements.length}
              </small>
            </h3>

            <ul className="dash-achievements">
              {achievements.map((item) => (
                <li
                  key={item.id}
                  className={item.unlocked ? "is-unlocked" : "is-locked"}
                >
                  <span className="dash-achievement-icon">
                    <Icon name={item.icon} />
                  </span>

                  <span className="dash-achievement-text">
                    <strong>{item.title}</strong>

                    <small>{item.unlocked ? "Desbloqueada" : "Bloqueada"}</small>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Lembretes */}

          <section className="dash-panel">
            <header className="dash-panel-header">
              <span className="dash-panel-icon">
                <Icon name="bell" />
              </span>

              <div>
                <h3>Lembretes</h3>

                <p>Aulas e prazos próximos</p>
              </div>
            </header>

            {visibleReminders.length === 0 ? (
              <div className="dash-empty">
                <strong>Nenhum lembrete no momento</strong>

                <p>
                  Avisaremos aqui sobre aulas de hoje ou amanhã e atividades
                  com prazo próximo.
                </p>
              </div>
            ) : (
              <ul className="dash-rows">
                {visibleReminders.map((item) => (
                  <li key={item.id}>
                    <Link to={item.to} className="dash-row">
                      <span className="dash-row-icon">
                        <Icon name={item.icon} />
                      </span>

                      <span className="dash-row-body">
                        <strong>{item.title}</strong>

                        <small>{item.text}</small>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </main>
  );
}

export default Dashboard;