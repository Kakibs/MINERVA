
import { useEffect, useMemo, useState } from "react";
import "./Atividades.css";

/* =========================================================
   MINERVA — ÁREA DO ALUNO: ATIVIDADES
   ========================================================= */

/* ---------- Funções auxiliares ---------- */

function readList(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function readUser() {
  try {
    return JSON.parse(localStorage.getItem("minervaLoggedUser") || "null");
  } catch {
    return null;
  }
}

function saveList(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function normalizeId(value) {
  return value == null ? "" : String(value);
}

function sameId(first, second) {
  return normalizeId(first) === normalizeId(second);
}

function getActivityTitle(activity) {
  return activity.titulo || activity.title || activity.nome || "Atividade sem título";
}

function getActivitySubject(activity) {
  return activity.disciplina || activity.subject || activity.materia || "Geral";
}

function getActivityDescription(activity) {
  return activity.descricao || activity.description || activity.instrucoes || "";
}

function getActivityDeadline(activity) {
  return activity.prazo || activity.deadline || activity.dataEntrega || "";
}

function getStudentId(user) {
  return user?.id ?? user?.userId ?? user?.email ?? "";
}

function getStudentName(user) {
  return user?.nome || user?.name || user?.email || "Aluno";
}

function formatDate(value) {
  if (!value) return "Sem prazo definido";

  const date = new Date(`${String(value).slice(0, 10)}T12:00:00`);

  if (Number.isNaN(date.getTime())) return "Data não definida";

  return date.toLocaleDateString("pt-BR");
}

function isOverdue(activity, submission) {
  const deadline = getActivityDeadline(activity);

  if (!deadline || submission) return false;

  const deadlineDate = new Date(`${String(deadline).slice(0, 10)}T23:59:59`);

  return !Number.isNaN(deadlineDate.getTime()) && deadlineDate < new Date();
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve({
      name: file.name,
      type: file.type || "application/octet-stream",
      size: file.size,
      data: reader.result,
    });

    reader.onerror = () => reject(new Error(`Não foi possível ler ${file.name}.`));

    reader.readAsDataURL(file);
  });
}

/* ---------- Componente principal ---------- */

export default function Atividades() {
  const [user, setUser] = useState(() => readUser());
  const [activities, setActivities] = useState(() => readList("minervaAtividades"));
  const [submissions, setSubmissions] = useState(() => readList("minervaEntregas"));
  const [corrections, setCorrections] = useState(() => readList("minervaCorrecoes"));
  const [feedbacks, setFeedbacks] = useState(() => readList("minervaFeedbackAtividades"));

  const [filter, setFilter] = useState("Todas");
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [answer, setAnswer] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [studentFeedback, setStudentFeedback] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);

  const studentId = getStudentId(user);

  /* Atualiza os dados quando o usuário retorna à página. */
  useEffect(() => {
    function refreshData() {
      setUser(readUser());
      setActivities(readList("minervaAtividades"));
      setSubmissions(readList("minervaEntregas"));
      setCorrections(readList("minervaCorrecoes"));
      setFeedbacks(readList("minervaFeedbackAtividades"));
    }

    window.addEventListener("storage", refreshData);
    window.addEventListener("focus", refreshData);

    return () => {
      window.removeEventListener("storage", refreshData);
      window.removeEventListener("focus", refreshData);
    };
  }, []);

  /* Persiste as alterações nas mesmas chaves do projeto. */
  function updateSubmissions(next) {
    setSubmissions(next);
    saveList("minervaEntregas", next);
  }

  function updateCorrections(next) {
    setCorrections(next);
    saveList("minervaCorrecoes", next);
  }

  function updateFeedbacks(next) {
    setFeedbacks(next);
    saveList("minervaFeedbackAtividades", next);
  }

  /* ---------- Filtragem das atividades ---------- */

  const visibleActivities = useMemo(() => {
    const studentSubjects = Array.isArray(user?.subjects)
      ? user.subjects.map((subject) => {
          if (typeof subject === "string") return subject.toLowerCase();
          return String(subject?.nome || subject?.name || subject?.disciplina || "").toLowerCase();
        })
      : [];

    return activities.filter((activity) => {
      const activitySubject = getActivitySubject(activity).toLowerCase();

      const matchesSubject =
        studentSubjects.length === 0 ||
        studentSubjects.includes(activitySubject) ||
        studentSubjects.includes("todas");

      const submission = submissions.find(
        (item) =>
          sameId(item.activityId, activity.id) &&
          sameId(item.studentId, studentId)
      );

      if (!matchesSubject) return false;

      if (filter === "Pendentes") return !submission && !isOverdue(activity, submission);
      if (filter === "Entregues") return Boolean(submission);
      if (filter === "Atrasadas") return isOverdue(activity, submission);

      return true;
    });
  }, [activities, submissions, user, studentId, filter]);

  const stats = useMemo(() => {
    let delivered = 0;
    let overdue = 0;
    let pending = 0;

    activities.forEach((activity) => {
      const submission = submissions.find(
        (item) =>
          sameId(item.activityId, activity.id) &&
          sameId(item.studentId, studentId)
      );

      if (submission) delivered += 1;
      else if (isOverdue(activity, submission)) overdue += 1;
      else pending += 1;
    });

    return { total: activities.length, delivered, overdue, pending };
  }, [activities, submissions, studentId]);

  /* ---------- Dados da atividade selecionada ---------- */

  const currentActivity = selectedActivity
    ? activities.find((activity) => sameId(activity.id, selectedActivity.id)) || selectedActivity
    : null;

  const currentSubmission = currentActivity
    ? submissions.find(
        (item) =>
          sameId(item.activityId, currentActivity.id) &&
          sameId(item.studentId, studentId)
      )
    : null;

  const currentCorrection = currentSubmission
    ? corrections.find(
        (item) =>
          sameId(item.activityId, currentActivity?.id) &&
          sameId(item.studentId, studentId)
      )
    : null;

  const currentFeedback = currentActivity
    ? feedbacks.find(
        (item) =>
          sameId(item.activityId, currentActivity.id) &&
          sameId(item.studentId, studentId)
      )
    : null;

  /* ---------- Abrir atividade ---------- */

  function openActivity(activity) {
    const submission = submissions.find(
      (item) =>
        sameId(item.activityId, activity.id) &&
        sameId(item.studentId, studentId)
    );

    const feedback = feedbacks.find(
      (item) =>
        sameId(item.activityId, activity.id) &&
        sameId(item.studentId, studentId)
    );

    setSelectedActivity(activity);
    setAnswer(submission?.answer || "");
    setAttachments(Array.isArray(submission?.attachments) ? submission.attachments : []);
    setStudentFeedback(feedback?.message || "");
    setNotice("");
  }

  function closeActivity() {
    setSelectedActivity(null);
    setAnswer("");
    setAttachments([]);
    setStudentFeedback("");
    setNotice("");
  }

  /* ---------- Anexos ---------- */

  async function handleFiles(event) {
    const files = Array.from(event.target.files || []);
    event.target.value = "";

    if (!files.length) return;

    const maxSize = 2 * 1024 * 1024;
    const accepted = [];
    const errors = [];

    for (const file of files) {
      if (file.size > maxSize) {
        errors.push(`${file.name}: o arquivo ultrapassa 2 MB.`);
        continue;
      }

      try {
        const converted = await readFileAsDataURL(file);
        accepted.push(converted);
      } catch {
        errors.push(`${file.name}: não foi possível carregar o arquivo.`);
      }
    }

    setAttachments((previous) => [...previous, ...accepted]);

    if (errors.length) setNotice(errors.join(" "));
    else setNotice(accepted.length ? "Arquivo(s) adicionado(s)." : "");
  }

  function removeAttachment(index) {
    setAttachments((previous) => previous.filter((_, i) => i !== index));
  }

  /* ---------- Enviar ou atualizar entrega ---------- */

  async function handleSubmitActivity(event) {
    event.preventDefault();

    if (!currentActivity || !studentId) {
      setNotice("Não foi possível identificar o aluno. Entre novamente na sua conta.");
      return;
    }

    if (!answer.trim() && attachments.length === 0) {
      setNotice("Escreva sua resposta ou anexe pelo menos um arquivo.");
      return;
    }

    setSaving(true);
    setNotice("");

    try {
      const previousSubmission = submissions.find(
        (item) =>
          sameId(item.activityId, currentActivity.id) &&
          sameId(item.studentId, studentId)
      );

      const submissionId = previousSubmission?.id ?? (
        "entrega-" + Date.now().toString() + "-" + String(studentId)
      );

      const newSubmission = {
        ...(previousSubmission || {}),
        id: submissionId,
        activityId: currentActivity.id,
        studentId,
        studentName: getStudentName(user),
        answer: answer.trim(),
        attachments,
        submittedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const nextSubmissions = previousSubmission
        ? submissions.map((item) =>
            sameId(item.id, previousSubmission.id) ? newSubmission : item
          )
        : [...submissions, newSubmission];

      updateSubmissions(nextSubmissions);

      /*
       * Uma entrega atualizada precisa de nova correção.
       * Por isso, removemos a correção anterior desta atividade/aluno.
       */
      if (previousSubmission) {
        const nextCorrections = corrections.filter(
          (item) =>
            !(
              sameId(item.activityId, currentActivity.id) &&
              sameId(item.studentId, studentId)
            )
        );

        updateCorrections(nextCorrections);
      }

      setNotice("Atividade entregue com sucesso!");
    } catch {
      setNotice("Não foi possível salvar sua entrega. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  /* ---------- Feedback privado para o professor ---------- */

  function handleSubmitFeedback(event) {
    event.preventDefault();

    if (!currentActivity || !studentId) {
      setNotice("Não foi possível identificar a atividade ou o aluno.");
      return;
    }

    if (!studentFeedback.trim()) {
      setNotice("Escreva seu feedback antes de enviar.");
      return;
    }

    const previousFeedback = feedbacks.find(
      (item) =>
        sameId(item.activityId, currentActivity.id) &&
        sameId(item.studentId, studentId)
    );

    const newFeedback = {
      ...(previousFeedback || {}),
      id: previousFeedback?.id ?? (
        "feedback-" + Date.now().toString() + "-" + String(studentId)
      ),
      activityId: currentActivity.id,
      studentId,
      studentName: getStudentName(user),
      message: studentFeedback.trim(),
      createdAt: previousFeedback?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const nextFeedbacks = previousFeedback
      ? feedbacks.map((item) =>
          sameId(item.id, previousFeedback.id) ? newFeedback : item
        )
      : [...feedbacks, newFeedback];

    updateFeedbacks(nextFeedbacks);
    setNotice("Seu feedback foi enviado.");
  }

  /* ---------- Tela sem usuário conectado ---------- */

  if (!user) {
    return (
      <main className="activities-page">
        <section className="activities-empty">
          <h2>Entre na sua conta</h2>
          <p>Faça login no Minerva para visualizar suas atividades.</p>
        </section>
      </main>
    );
  }

  /* ---------- Interface ---------- */

  return (
    <main className="activities-page">
      <header className="activities-header">
        <div>
          <span className="activities-eyebrow">ÁREA DO ALUNO</span>
          <h1>Atividades</h1>
          <p>Acompanhe suas tarefas, entregue suas respostas e consulte suas correções.</p>
        </div>
      </header>

      {/* Indicadores */}
      <section className="activities-stats">
        <article className="activities-stat-card">
          <span className="activities-stat-label">Total de atividades</span>
          <strong>{stats.total}</strong>
          <span>Disponibilizadas para você</span>
        </article>

        <article className="activities-stat-card">
          <span className="activities-stat-label">Pendentes</span>
          <strong>{stats.pending}</strong>
          <span>Precisam da sua atenção</span>
        </article>

        <article className="activities-stat-card">
          <span className="activities-stat-label">Entregues</span>
          <strong>{stats.delivered}</strong>
          <span>Respostas enviadas</span>
        </article>

        <article className="activities-stat-card">
          <span className="activities-stat-label">Atrasadas</span>
          <strong>{stats.overdue}</strong>
          <span>Prazo encerrado sem entrega</span>
        </article>
      </section>

      {/* Filtros */}
      <section className="activities-toolbar">
        <div>
          <h2>Suas atividades</h2>
          <p>Organize suas tarefas e acompanhe os prazos.</p>
        </div>

        <div className="activities-filters" aria-label="Filtrar atividades">
          {["Todas", "Pendentes", "Entregues", "Atrasadas"].map((option) => (
            <button
              key={option}
              type="button"
              className={filter === option ? "active" : ""}
              onClick={() => setFilter(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </section>

      {/* Lista */}
      {visibleActivities.length === 0 ? (
        <section className="activities-empty">
          <span className="activities-empty-icon">✦</span>
          <h3>Nenhuma atividade encontrada</h3>
          <p>
            {filter === "Todas"
              ? "Quando seus professores publicarem atividades, elas aparecerão aqui."
              : "Não há atividades nesta categoria no momento."}
          </p>
        </section>
      ) : (
        <section className="activities-grid">
          {visibleActivities.map((activity) => {
            const submission = submissions.find(
              (item) =>
                sameId(item.activityId, activity.id) &&
                sameId(item.studentId, studentId)
            );

            const overdue = isOverdue(activity, submission);
            const correction = corrections.find(
              (item) =>
                sameId(item.activityId, activity.id) &&
                sameId(item.studentId, studentId)
            );

            let status = "Pendente";

            if (submission) status = "Entregue";
            else if (overdue) status = "Atrasada";

            return (
              <article
                className="activity-card"
                key={activity.id ?? getActivityTitle(activity)}
              >
                <div className="activity-card-top">
                  <span className="activity-subject">
                    {getActivitySubject(activity)}
                  </span>

                  <span
                    className={
                      "activity-status " +
                      (status === "Entregue"
                        ? "status-delivered"
                        : status === "Atrasada"
                          ? "status-overdue"
                          : "status-pending")
                    }
                  >
                    {status}
                  </span>
                </div>

                <h3>{getActivityTitle(activity)}</h3>

                <p className="activity-description">
                  {getActivityDescription(activity) || "Consulte as instruções da atividade."}
                </p>

                <div className="activity-card-meta">
                  <span>
                    <strong>Prazo:</strong> {formatDate(getActivityDeadline(activity))}
                  </span>

                  {submission && (
                    <span>
                      <strong>Entrega:</strong>{" "}
                      {formatDate(submission.submittedAt)}
                    </span>
                  )}
                </div>

                {correction && (
                  <div className="activity-correction-preview">
                    <span>Correção disponível</span>
                    {correction.nota != null && (
                      <strong>Nota: {correction.nota}</strong>
                    )}
                    {correction.grade != null && (
                      <strong>Nota: {correction.grade}</strong>
                    )}
                  </div>
                )}

                <button
                  className="activity-open-button"
                  type="button"
                  onClick={() => openActivity(activity)}
                >
                  {submission ? "Ver atividade" : "Abrir atividade"}
                  <span aria-hidden="true">→</span>
                </button>
              </article>
            );
          })}
        </section>
      )}

      {/* Painel de detalhes */}
      {currentActivity && (
        <div className="activity-modal-overlay" onClick={closeActivity}>
          <section
            className="activity-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="activity-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="activity-modal-header">
              <div>
                <span className="activity-subject">
                  {getActivitySubject(currentActivity)}
                </span>
                <h2 id="activity-modal-title">
                  {getActivityTitle(currentActivity)}
                </h2>
                <p>Prazo: {formatDate(getActivityDeadline(currentActivity))}</p>
              </div>

              <button
                className="activity-close-button"
                type="button"
                onClick={closeActivity}
                aria-label="Fechar atividade"
              >
                ×
              </button>
            </div>

            <div className="activity-modal-content">
              <section className="activity-instructions">
                <h3>Instruções</h3>
                <p>
                  {getActivityDescription(currentActivity) ||
                    "Leia as orientações do professor e envie sua resposta."}
                </p>
              </section>

              {/* Materiais fornecidos pelo professor */}
              {(() => {
                const materials =
                  currentActivity.materiais ||
                  currentActivity.anexos ||
                  currentActivity.attachments ||
                  [];

                if (!Array.isArray(materials) || materials.length === 0) return null;

                return (
                  <section className="activity-materials">
                    <h3>Materiais da atividade</h3>

                    {materials.map((material, index) => {
                      const name =
                        typeof material === "string"
                          ? material
                          : material.nome || material.name || "Material";

                      const url =
                        typeof material === "string"
                          ? material
                          : material.url || material.data || material.conteudo;

                      return (
                        <div className="activity-file-row" key={index}>
                          <span>{name}</span>
                          {url && (
                            <a href={url} target="_blank" rel="noreferrer">
                              Abrir arquivo
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </section>
                );
              })()}

              {/* Formulário de entrega */}
              <form className="activity-submit-panel" onSubmit={handleSubmitActivity}>
                <h3>Sua resposta</h3>

                <label htmlFor="activity-answer">Resposta escrita</label>
                <textarea
                  id="activity-answer"
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  placeholder="Escreva sua resposta aqui..."
                  rows={7}
                />

                <div className="activity-upload-area">
                  <label htmlFor="activity-files">
                    Anexar arquivos (máximo de 2 MB por arquivo)
                  </label>

                  <input
                    id="activity-files"
                    type="file"
                    multiple
                    onChange={handleFiles}
                  />
                </div>

                {attachments.length > 0 && (
                  <div className="activity-attachments">
                    <h4>Arquivos anexados</h4>

                    {attachments.map((file, index) => (
                      <div className="activity-file-row" key={index}>
                        <span>
                          {file.name}{" "}
                          <small>
                            ({(file.size / 1024).toFixed(0)} KB)
                          </small>
                        </span>

                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                        >
                          Remover
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {currentSubmission && (
                  <p className="activity-submission-note">
                    Você já enviou esta atividade. Ao enviar novamente, sua entrega
                    será atualizada e a correção anterior será removida para uma nova avaliação.
                  </p>
                )}

                <button
                  className="activity-submit-button"
                  type="submit"
                  disabled={saving}
                >
                  {saving
                    ? "Salvando..."
                    : currentSubmission
                      ? "Atualizar entrega"
                      : "Enviar atividade"}
                </button>
              </form>

              {/* Correção do professor */}
              {currentCorrection && (
                <section className="activity-correction-panel">
                  <h3>Correção do professor</h3>

                  {(currentCorrection.nota != null ||
                    currentCorrection.grade != null) && (
                    <div className="activity-grade">
                      <span>Nota</span>
                      <strong>
                        {currentCorrection.nota ?? currentCorrection.grade}
                      </strong>
                    </div>
                  )}

                  {(currentCorrection.feedback ||
                    currentCorrection.comentario ||
                    currentCorrection.comment) && (
                    <div>
                      <h4>Comentário</h4>
                      <p>
                        {currentCorrection.feedback ||
                          currentCorrection.comentario ||
                          currentCorrection.comment}
                      </p>
                    </div>
                  )}
                </section>
              )}

              {/* Feedback privado */}
              <form
                className="activity-feedback-panel"
                onSubmit={handleSubmitFeedback}
              >
                <h3>Deixe seu feedback</h3>
                <p>
                  Compartilhe dúvidas, dificuldades ou sugestões sobre esta atividade.
                </p>

                <label htmlFor="activity-feedback">Mensagem para o professor</label>
                <textarea
                  id="activity-feedback"
                  value={studentFeedback}
                  onChange={(event) => setStudentFeedback(event.target.value)}
                  placeholder="Conte como foi realizar esta atividade..."
                  rows={4}
                />

                <button className="activity-feedback-button" type="submit">
                  {currentFeedback ? "Atualizar feedback" : "Enviar feedback"}
                </button>
              </form>

              {notice && (
                <p className="activity-notice" role="status">
                  {notice}
                </p>
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}