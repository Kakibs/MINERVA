import "./Cronograma.css";

/* ==========================================================
   LEITURA DO LOCALSTORAGE
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

// Aceita só datas no formato AAAA-MM-DD que existam de verdade
function isValidDate(dateValue) {
  if (typeof dateValue !== "string") {
    return false;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    return false;
  }

  return !Number.isNaN(new Date(dateValue + "T00:00").getTime());
}

function startOfToday() {
  const today = new Date();

  return new Date(today.getFullYear(), today.getMonth(), today.getDate());
}

// Dias até a data: 0 = hoje, 1 = amanhã, -1 = ontem
function daysUntil(dateValue) {
  const [year, month, day] = dateValue.split("-").map(Number);

  const target = new Date(year, month - 1, day);

  return Math.round((target - startOfToday()) / (1000 * 60 * 60 * 24));
}

function formatDate(dateValue) {
  const parts = dateValue.split("-");

  return parts[2] + "/" + parts[1] + "/" + parts[0];
}

function dayLabel(dateValue) {
  const difference = daysUntil(dateValue);

  if (difference === 0) {
    return "Hoje";
  }

  if (difference === 1) {
    return "Amanhã";
  }

  if (difference === -1) {
    return "Ontem";
  }

  const [year, month, day] = dateValue.split("-").map(Number);

  const name = new Date(year, month - 1, day).toLocaleDateString("pt-BR", {
    weekday: "long",
  });

  return name.charAt(0).toUpperCase() + name.slice(1);
}

// Agrupa os eventos por data: { "2026-10-12": [evento, evento] }
function groupByDate(events) {
  const groups = new Map();

  events.forEach((event) => {
    const list = groups.get(event.date) || [];

    list.push(event);
    groups.set(event.date, list);
  });

  return groups;
}

// Dentro do mesmo dia: aulas primeiro (por horário), depois os prazos
function sortWithinDay(a, b) {
  if (a.kind === "AULA" && b.kind !== "AULA") {
    return -1;
  }

  if (a.kind !== "AULA" && b.kind === "AULA") {
    return 1;
  }

  return String(a.time || "").localeCompare(String(b.time || ""));
}


/* ==========================================================
   PÁGINA
   ========================================================== */

function Cronograma() {
  /* ---------- Dados salvos ---------- */

  const user = readObject("minervaLoggedUser");

  const subjects = Array.isArray(user?.subjects) ? user.subjects : [];

  const classes = readList("minervaCronograma");
  const activities = readList("minervaAtividades");
  const redacoes = readList("minervaRedacoes");

  const activityDeliveries = readList("minervaEntregas").filter((item) =>
    belongsToStudent(item, user)
  );

  const essayDeliveries = readList("minervaEntregasRedacoes").filter((item) =>
    belongsToStudent(item, user)
  );


  /* ---------- Eventos: aulas + prazos ---------- */

  const events = [];

  classes
    .filter((item) => subjects.includes(item.subject))
    .filter((item) => isValidDate(item.date))
    .forEach((item, index) => {
      events.push({
        id: "aula-" + (item.id ?? item.date + "-" + item.time + "-" + index),
        kind: "AULA",
        date: item.date,
        time: item.time || "",
        subject: item.subject,
        title: item.description || "Aula de " + item.subject,
        detail: item.room ? "Sala: " + item.room : "Sala não informada",
        status: null,
      });
    });

  activities
    .filter((item) => subjects.includes(item.subject))
    .filter((item) => isValidDate(item.deadline))
    .forEach((item) => {
      const delivered = activityDeliveries.some((delivery) =>
        sameId(delivery.activityId, item.id)
      );

      events.push({
        id: "atividade-" + item.id,
        kind: "ATIVIDADE",
        date: item.deadline,
        time: "",
        subject: item.subject,
        title: item.title || "Atividade",
        detail: "Prazo de entrega",
        status: delivered ? "delivered" : "pending",
      });
    });

  redacoes
    .filter((item) => subjects.includes(item.subject))
    .filter((item) => isValidDate(item.deadline))
    .forEach((item) => {
      const delivered = essayDeliveries.some((delivery) =>
        sameId(delivery.redacaoId, item.id)
      );

      events.push({
        id: "redacao-" + item.id,
        kind: "REDAÇÃO",
        date: item.deadline,
        time: "",
        subject: item.subject,
        title: item.title || "Redação",
        detail: "Prazo de entrega",
        status: delivered ? "delivered" : "pending",
      });
    });


  /* ---------- Separação: a partir de hoje x anteriores ---------- */

  const upcomingEvents = events.filter((event) => daysUntil(event.date) >= 0);

  const pastEvents = events.filter((event) => daysUntil(event.date) < 0);

  const upcomingGroups = [...groupByDate(upcomingEvents).entries()].sort(
    (a, b) => a[0].localeCompare(b[0])
  );

  // Anteriores: do mais recente para o mais antigo, no máximo 30 eventos
  const pastGroups = [
    ...groupByDate(
      [...pastEvents]
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 30)
    ).entries(),
  ].sort((a, b) => b[0].localeCompare(a[0]));


  /* ---------- Avisos (derivados de aulas e prazos reais) ---------- */

  const notices = [];

  events
    .filter((event) => event.kind === "AULA")
    .filter((event) => {
      const difference = daysUntil(event.date);

      return difference === 0 || difference === 1;
    })
    .sort(
      (a, b) =>
        a.date.localeCompare(b.date) ||
        String(a.time).localeCompare(String(b.time))
    )
    .forEach((event) => {
      notices.push({
        id: "aviso-" + event.id,
        label: dayLabel(event.date).toUpperCase() + " • AULA",
        text:
          event.subject +
          (event.time ? " às " + event.time : "") +
          (event.detail ? " • " + event.detail : ""),
      });
    });

  events
    .filter((event) => event.status === "pending")
    .sort((a, b) => a.date.localeCompare(b.date))
    .forEach((event) => {
      const difference = daysUntil(event.date);

      if (difference > 1) {
        return;
      }

      notices.push({
        id: "aviso-" + event.id,
        label:
          difference < 0
            ? "PRAZO VENCIDO • " + event.kind
            : "PRAZO " + dayLabel(event.date).toUpperCase() + " • " + event.kind,
        text:
          event.title +
          " (" +
          event.subject +
          ") • " +
          formatDate(event.date),
      });
    });

  const visibleNotices = notices.slice(0, 6);


  /* ---------- Cartão de cada evento ---------- */

  function renderEvent(event) {
    const overdue = event.status === "pending" && daysUntil(event.date) < 0;

    return (
      <article
        className="schedule-card"
        key={event.id}
        data-kind={event.kind}
      >
        <div className="schedule-date">
          <span>{event.kind}</span>

          <strong>{event.time || "Prazo"}</strong>
        </div>

        <div className="schedule-info">
          <span className="schedule-subject">{event.subject}</span>

          <h2>{event.title}</h2>

          <p>{event.detail}</p>

          {event.status === "delivered" && (
            <span
              className="submission-status"
              style={{ alignSelf: "flex-start" }}
            >
              ENTREGUE
            </span>
          )}

          {event.status === "pending" && !overdue && (
            <span
              className="activity-status"
              style={{ alignSelf: "flex-start" }}
            >
              Pendente
            </span>
          )}

          {overdue && (
            <span
              className="activity-status"
              style={{
                alignSelf: "flex-start",
                color: "#fca5a5",
                borderColor: "rgba(239, 68, 68, 0.3)",
                background: "rgba(239, 68, 68, 0.08)",
              }}
            >
              Atrasada
            </span>
          )}
        </div>
      </article>
    );
  }

  function renderDay(date, dayEvents) {
    return (
      <div
        className="schedule-day"
        key={date}
        data-today={daysUntil(date) === 0 ? "true" : undefined}
      >
        <div className="schedule-day-header">
          <h2>{dayLabel(date)}</h2>

          <time dateTime={date}>{formatDate(date)}</time>
        </div>

        {[...dayEvents].sort(sortWithinDay).map(renderEvent)}
      </div>
    );
  }


  /* ==========================================================
     TELA
     ========================================================== */

  return (
    <main className="page schedule-page">
      <section className="page-header">
        <p className="page-label">CRONOGRAMA</p>

        <h1>Meu cronograma</h1>

        <p>
          Acompanhe aulas, prazos de atividades e redações das disciplinas
          que você está cursando.
        </p>
      </section>

      {events.length === 0 ? (
        <section className="content-section">
          <div className="empty-state">
            <h2>Nada agendado ainda</h2>

            <p>
              As aulas são cadastradas pela administração, e os prazos vêm das
              atividades e redações criadas pelos seus professores. Quando
              existirem, eles aparecem aqui.
            </p>
          </div>
        </section>
      ) : (
        <>
          {/* ---------- Avisos ---------- */}

          <section className="content-section" style={{ marginBottom: 32 }}>
            <div className="section-header">
              <h2>Avisos</h2>
            </div>

            {visibleNotices.length === 0 ? (
              <div className="student-existing-submission" style={{ margin: 0 }}>
                <span>SEM AVISOS</span>

                <p>
                  Nenhuma aula hoje ou amanhã e nenhum prazo próximo ou vencido.
                </p>
              </div>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 8 }}
              >
                {visibleNotices.map((notice) => (
                  <div
                    className="student-existing-submission"
                    style={{ margin: 0 }}
                    key={notice.id}
                  >
                    <span>{notice.label}</span>

                    <p>{notice.text}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ---------- Próximos eventos ---------- */}

          <section className="content-section">
            <div className="section-header">
              <h2>Aulas e prazos</h2>
            </div>

            {upcomingGroups.length === 0 ? (
              <div className="empty-state">
                <h2>Nada a partir de hoje</h2>

                <p>
                  Não há aulas nem prazos a partir de hoje para as suas
                  disciplinas.
                </p>
              </div>
            ) : (
              <div className="schedule-list">
                {upcomingGroups.map(([date, dayEvents]) =>
                  renderDay(date, dayEvents)
                )}
              </div>
            )}
          </section>

          {/* ---------- Anteriores ---------- */}

          {pastGroups.length > 0 && (
            <details style={{ marginTop: 32 }}>
              <summary
                style={{
                  marginBottom: 20,
                  color: "#94a3b8",
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Anteriores ({pastEvents.length})
              </summary>

              <div className="schedule-list">
                {pastGroups.map(([date, dayEvents]) =>
                  renderDay(date, dayEvents)
                )}
              </div>
            </details>
          )}
        </>
      )}
    </main>
  );
}

export default Cronograma;