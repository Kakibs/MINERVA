import { useState } from "react";
import "./ProfessorRedacoes.css";

// Lê uma lista do localStorage sem quebrar se o dado estiver corrompido
function readList(key) {
  try {
    const saved = localStorage.getItem(key);
    const parsed = saved ? JSON.parse(saved) : [];

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Lê um objeto do localStorage
function readObject(key) {
  try {
    const saved = localStorage.getItem(key);

    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

// Salva no localStorage
function persist(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

// Protege o nome do arquivo antes de colocar no HTML
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function ProfessorRedacoes() {
  const loggedUser = readObject("minervaLoggedUser");

  const professorSubjects = loggedUser?.subjects || [];

  const [redacoes, setRedacoes] = useState(() =>
    readList("minervaRedacoes")
  );

  const [submissions, setSubmissions] = useState(() =>
    readList("minervaEntregasRedacoes")
  );

  const [corrections, setCorrections] = useState(() =>
    readList("minervaCorrecoesRedacoes")
  );

  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [view, setView] = useState("detalhes");

  const [form, setForm] = useState({
    subject: "",
    title: "",
    prompt: "",
    instructions: "",
    deadline: "",
  });

  const [correctionSubmission, setCorrectionSubmission] =
    useState(null);

  const [grade, setGrade] = useState("");
  const [feedback, setFeedback] = useState("");
  const [message, setMessage] = useState("");

  // ==========================================
  // REDAÇÕES DO PROFESSOR
  // ==========================================

  const professorRedacoes = redacoes.filter(
    (item) =>
      item.professorId === loggedUser?.id ||
      (
        !item.professorId &&
        professorSubjects.includes(item.subject)
      )
  );

  // ==========================================
  // ENTREGAS DE UMA REDAÇÃO
  // ==========================================

  function getRedacaoSubmissions(redacaoId) {
    return submissions
      .filter((item) => item.redacaoId === redacaoId)
      .sort(
        (a, b) =>
          new Date(b.submittedAt) -
          new Date(a.submittedAt)
      );
  }

  // ==========================================
  // CORREÇÃO DE UMA ENTREGA
  // ==========================================

  function getCorrection(submissionId) {
    return corrections.find(
      (item) => item.submissionId === submissionId
    );
  }

  // ==========================================
  // DATAS
  // ==========================================

  function formatDate(dateValue) {
    if (!dateValue) {
      return "";
    }

    const parts = dateValue.split("-");

    if (parts.length !== 3) {
      return dateValue;
    }

    return (
      parts[2] +
      "/" +
      parts[1] +
      "/" +
      parts[0]
    );
  }

  function formatDateTime(isoValue) {
    if (!isoValue) {
      return "";
    }

    return new Date(isoValue).toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  // ==========================================
  // TAMANHO DOS ARQUIVOS
  // ==========================================

  function formatFileSize(size) {
    if (!size) {
      return "";
    }

    if (size < 1024) {
      return size + " B";
    }

    if (size < 1024 * 1024) {
      return (size / 1024).toFixed(1) + " KB";
    }

    return (
      (size / (1024 * 1024)).toFixed(1) +
      " MB"
    );
  }

  // ==========================================
  // ABRIR ARQUIVO ENVIADO
  // ==========================================

  function openAttachment(attachment) {
    if (!attachment?.dataUrl) {
      return;
    }

    const newWindow = window.open();

    if (!newWindow) {
      return;
    }

    newWindow.document.write(
      "<html><head><title>" +
        escapeHtml(attachment.name) +
        "</title></head>" +
        '<body style="margin:0;background:#0b0b14;">' +
        '<iframe src="' +
        attachment.dataUrl +
        '" style="width:100%;height:100vh;border:none;"></iframe>' +
        "</body></html>"
    );

    newWindow.document.close();
  }

  // ==========================================
  // FORMULÁRIO
  // ==========================================

  function handleFormChange(event) {
    const field = event.target.name;
    const value = event.target.value;

    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  // ==========================================
  // CRIAR REDAÇÃO
  // ==========================================

  function handleCreateRedacao(event) {
    event.preventDefault();
    setMessage("");

    if (
      !form.subject ||
      !form.title.trim() ||
      !form.prompt.trim() ||
      !form.deadline
    ) {
      setMessage(
        "Preencha disciplina, título, tema e prazo de entrega."
      );

      return;
    }

    const newRedacao = {
      id: crypto.randomUUID(),

      subject: form.subject,

      title: form.title.trim(),

      prompt: form.prompt.trim(),

      instructions: form.instructions.trim(),

      deadline: form.deadline,

      professorId: loggedUser?.id || null,

      professorName:
        loggedUser?.name || "Professor",

      createdAt: new Date().toISOString(),
    };

    const updated = [
      ...redacoes,
      newRedacao,
    ];

    if (!persist("minervaRedacoes", updated)) {
      setMessage(
        "Não foi possível salvar a redação."
      );

      return;
    }

    setRedacoes(updated);

    setForm({
      subject: "",
      title: "",
      prompt: "",
      instructions: "",
      deadline: "",
    });

    setShowForm(false);

    setMessage(
      "Redação criada com sucesso."
    );
  }

  // ==========================================
  // EXCLUIR REDAÇÃO
  // ==========================================

  function handleDeleteRedacao(redacaoId) {
    const confirmed = window.confirm(
      "Tem certeza que deseja excluir esta redação? As entregas e correções dela também serão apagadas."
    );

    if (!confirmed) {
      return;
    }

    const updatedRedacoes =
      redacoes.filter(
        (item) => item.id !== redacaoId
      );

    const updatedSubmissions =
      submissions.filter(
        (item) => item.redacaoId !== redacaoId
      );

    const updatedCorrections =
      corrections.filter(
        (item) => item.redacaoId !== redacaoId
      );

    const savedRedacoes = persist(
      "minervaRedacoes",
      updatedRedacoes
    );

    const savedSubmissions = persist(
      "minervaEntregasRedacoes",
      updatedSubmissions
    );

    const savedCorrections = persist(
      "minervaCorrecoesRedacoes",
      updatedCorrections
    );

    if (
      !savedRedacoes ||
      !savedSubmissions ||
      !savedCorrections
    ) {
      setMessage(
        "Não foi possível excluir a redação."
      );

      return;
    }

    setRedacoes(updatedRedacoes);
    setSubmissions(updatedSubmissions);
    setCorrections(updatedCorrections);

    if (
      selected &&
      selected.id === redacaoId
    ) {
      closePanel();
    }

    setMessage(
      "Redação excluída com sucesso."
    );
  }

  // ==========================================
  // ABRIR REDAÇÃO
  // ==========================================

  function openRedacao(redacao, nextView) {
    setSelected(redacao);

    setView(nextView);

    setCorrectionSubmission(null);

    setGrade("");

    setFeedback("");

    setMessage("");
  }

  // ==========================================
  // FECHAR PAINEL
  // ==========================================

  function closePanel() {
    setSelected(null);

    setView("detalhes");

    setCorrectionSubmission(null);

    setGrade("");

    setFeedback("");
  }

  // ==========================================
  // ABRIR CORREÇÃO
  // ==========================================

  function openCorrection(submission) {
    const existing =
      getCorrection(submission.id);

    setCorrectionSubmission(submission);

    if (existing) {
      setGrade(
        existing.grade === null
          ? ""
          : String(existing.grade)
      );

      setFeedback(
        existing.feedback || ""
      );
    } else {
      setGrade("");

      setFeedback("");
    }

    setMessage("");
  }

  // ==========================================
  // NOTIFICAÇÃO DE REDAÇÃO CORRIGIDA
  // ==========================================

  function createCorrectionNotification(
    correction,
    redacao
  ) {
    const savedNotifications =
      localStorage.getItem(
        "minervaNotificacoes"
      );

    let notifications = [];

    try {
      if (savedNotifications) {
        const parsed =
          JSON.parse(savedNotifications);

        if (Array.isArray(parsed)) {
          notifications = parsed;
        }
      }
    } catch {
      notifications = [];
    }

    const notificationId =
      "notificacao-correcao-redacao-" +
      correction.submissionId;

    const newNotification = {
      id: notificationId,

      userId:
        correction.studentId,

      type:
        "REDAÇÃO CORRIGIDA",

      title:
        "Sua redação foi corrigida",

      message:
        redacao.title,

      redacaoId:
        redacao.id,

      submissionId:
        correction.submissionId,

      read: false,

      createdAt:
        new Date().toISOString(),
    };

    const notificationExists =
      notifications.some(
        function (notification) {
          return (
            notification.id ===
            notificationId
          );
        }
      );

    let updatedNotifications;

    if (notificationExists) {
      updatedNotifications =
        notifications.map(
          function (notification) {
            if (
              notification.id ===
              notificationId
            ) {
              return newNotification;
            }

            return notification;
          }
        );
    } else {
      updatedNotifications = [
        ...notifications,
        newNotification,
      ];
    }

    localStorage.setItem(
      "minervaNotificacoes",
      JSON.stringify(
        updatedNotifications
      )
    );
  }

  // ==========================================
  // SALVAR CORREÇÃO
  // ==========================================

  function saveCorrection(event) {
    event.preventDefault();

    setMessage("");

    if (!correctionSubmission) {
      return;
    }

    const cleanFeedback =
      feedback.trim();

    if (
      grade === "" &&
      cleanFeedback === ""
    ) {
      setMessage(
        "Informe uma nota ou escreva um feedback."
      );

      return;
    }

    if (
      grade !== "" &&
      (
        Number.isNaN(Number(grade)) ||
        Number(grade) < 0 ||
        Number(grade) > 10
      )
    ) {
      setMessage(
        "A nota deve estar entre 0 e 10."
      );

      return;
    }

    const newCorrection = {
      id:
        "correcao-redacao-" +
        correctionSubmission.id,

      submissionId:
        correctionSubmission.id,

      redacaoId:
        correctionSubmission.redacaoId,

      studentId:
        correctionSubmission.studentId,

      studentName:
        correctionSubmission.studentName,

      grade:
        grade === ""
          ? null
          : Number(grade),

      feedback: cleanFeedback,

      professorId:
        loggedUser?.id || null,

      professorName:
        loggedUser?.name || "Professor",

      correctedAt:
        new Date().toISOString(),
    };

    const otherCorrections =
      corrections.filter(
        (item) =>
          item.submissionId !==
          correctionSubmission.id
      );

    const updated = [
      ...otherCorrections,
      newCorrection,
    ];

    if (
      !persist(
        "minervaCorrecoesRedacoes",
        updated
      )
    ) {
      setMessage(
        "Não foi possível salvar a correção."
      );

      return;
    }

    setCorrections(updated);

    const redacao =
      redacoes.find(
        (item) =>
          item.id ===
          correctionSubmission.redacaoId
      );

    if (redacao) {
      createCorrectionNotification(
        newCorrection,
        redacao
      );
    }

    setCorrectionSubmission(null);

    setGrade("");

    setFeedback("");

    setMessage(
      "Correção salva com sucesso."
    );
  }

  return (
  <main className="professor-content professor-essays-page">

      {/* ======================================
          CABEÇALHO
      ====================================== */}

      <section className="professor-welcome">

        <p className="professor-label">
          REDAÇÕES
        </p>

        <h1>
          Redações
        </h1>

        <p className="professor-description">
          Crie propostas de redação, acompanhe
          as entregas e faça correções.
        </p>

      </section>

      {/* ======================================
          PROPOSTAS
      ====================================== */}

      <section className="professor-section">

        <div className="professor-card">

          <div className="professor-section-header">

            <div>

              <span>
                MINHAS REDAÇÕES
              </span>

              <h2>
                Propostas criadas
              </h2>

              <p className="professor-description">
                Crie propostas e acompanhe
                a produção dos alunos.
              </p>

            </div>

            <button
              type="button"
              className="professor-primary-button"
              onClick={() => {
                setShowForm(!showForm);
                setMessage("");
              }}
            >
              {showForm
                ? "Fechar"
                : "Criar redação"}
            </button>

          </div>

          {message && (
            <p className="professor-message">
              {message}
            </p>
          )}

          {/* ==================================
              FORMULÁRIO DE CRIAÇÃO
          ================================== */}

          {showForm && (

            <form
              className="professor-form"
              onSubmit={handleCreateRedacao}
            >

              <label>

                Disciplina

                <select
                  name="subject"
                  value={form.subject}
                  onChange={handleFormChange}
                >

                  <option value="">
                    Selecione uma disciplina
                  </option>

                  {professorSubjects.map(
                    (subject) => (
                      <option
                        key={subject}
                        value={subject}
                      >
                        {subject}
                      </option>
                    )
                  )}

                </select>

              </label>

              <label>

                Título da redação

                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleFormChange}
                  placeholder="Ex.: Desafios da educação no Brasil"
                />

              </label>

              <label>

                Tema / proposta

                <textarea
                  name="prompt"
                  value={form.prompt}
                  onChange={handleFormChange}
                  placeholder="Descreva o tema da redação."
                  rows="5"
                />

              </label>

              <label>

                Instruções para o aluno
                (opcional)

                <textarea
                  name="instructions"
                  value={form.instructions}
                  onChange={handleFormChange}
                  placeholder="Ex.: Texto dissertativo-argumentativo, de 20 a 30 linhas."
                  rows="4"
                />

              </label>

              <label>

                Prazo de entrega

                <input
                  type="date"
                  name="deadline"
                  value={form.deadline}
                  onChange={handleFormChange}
                />

              </label>

              <button
                type="submit"
                className="professor-primary-button"
              >
                Criar redação
              </button>

            </form>

          )}

          {/* ==================================
              LISTA DE REDAÇÕES
          ================================== */}

          <div className="professor-list">

            {professorRedacoes.length === 0 ? (

              <div className="professor-empty">

                <h3>
                  Nenhuma redação encontrada
                </h3>

                <p>
                  Crie sua primeira proposta
                  para começar.
                </p>

              </div>

            ) : (

              professorRedacoes.map(
                (redacao) => {

                  const redacaoSubmissions =
                    getRedacaoSubmissions(
                      redacao.id
                    );

                  const correctedCount =
                    redacaoSubmissions.filter(
                      (item) =>
                        Boolean(
                          getCorrection(item.id)
                        )
                    ).length;

                  return (
                    <article
                      className="professor-list-item"
                      key={redacao.id}
                    >

                      <div>

                        <span>
                          {redacao.subject}
                        </span>

                        <h3>
                          {redacao.title}
                        </h3>

                        <p>
                          Prazo:{" "}
                          {formatDate(
                            redacao.deadline
                          )}
                        </p>

                        <p>
                          Entregas:{" "}
                          {redacaoSubmissions.length}
                          {" • "}
                          Corrigidas:{" "}
                          {correctedCount}
                        </p>

                      </div>

                      <div className="professor-list-actions">

                        <button
                          type="button"
                          onClick={() =>
                            openRedacao(
                              redacao,
                              "detalhes"
                            )
                          }
                        >
                          Ver redação
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            openRedacao(
                              redacao,
                              "entregas"
                            )
                          }
                        >
                          Ver entregas
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteRedacao(
                              redacao.id
                            )
                          }
                        >
                          Excluir
                        </button>

                      </div>

                    </article>
                  );
                }
              )

            )}

          </div>

        </div>

      </section>

      {/* ======================================
          REDAÇÃO SELECIONADA
      ====================================== */}

      {selected && (

        <section className="professor-section">

          <div className="professor-card">

            <div className="professor-section-header">

              <div>

                <span>
                  {selected.subject}
                </span>

                <h2>
                  {selected.title}
                </h2>

                <p className="professor-description">
                  Prazo:{" "}
                  {formatDate(
                    selected.deadline
                  )}
                </p>

              </div>

              <button
                type="button"
                className="professor-secondary-button"
                onClick={closePanel}
              >
                Fechar
              </button>

            </div>

            {/* ==================================
                DETALHES
            ================================== */}

            {view === "detalhes" ? (

              <>

                <div className="submission-answer">

                  <span>
                    TEMA / PROPOSTA
                  </span>

                  <p
                    style={{
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {selected.prompt}
                  </p>

                </div>

                {selected.instructions && (

                  <div className="submission-answer">

                    <span>
                      INSTRUÇÕES PARA O ALUNO
                    </span>

                    <p
                      style={{
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {selected.instructions}
                    </p>

                  </div>

                )}

                <button
                  type="button"
                  className="professor-secondary-button"
                  onClick={() =>
                    setView("entregas")
                  }
                >
                  Ver entregas
                </button>

              </>

            ) : (

              /* =================================
                 ENTREGAS
              ================================= */

              <>

                <div className="professor-section-header">

                  <div>

                    <span>
                      ENTREGAS
                    </span>

                    <h2>
                      Redações dos alunos
                    </h2>

                  </div>

                </div>

                {getRedacaoSubmissions(
                  selected.id
                ).length === 0 ? (

                  <div className="professor-empty">

                    <h3>
                      Nenhuma entrega ainda
                    </h3>

                    <p>
                      Os alunos ainda não enviaram
                      esta redação.
                    </p>

                  </div>

                ) : (

                  <div className="submission-list">

                    {getRedacaoSubmissions(
                      selected.id
                    ).map((submission) => {

                      const existingCorrection =
                        getCorrection(
                          submission.id
                        );

                      return (

                        <article
                          className="submission-card"
                          key={submission.id}
                        >

                          {/* ALUNO */}

                          <div className="submission-header">

                            <div>

                              <span>
                                ALUNO
                              </span>

                              <h3>
                                {submission.studentName}
                              </h3>

                              <p>
                                {submission.studentEmail}
                              </p>

                            </div>

                            <span className="submission-status">
                              {formatDateTime(
                                submission.submittedAt
                              )}
                            </span>

                          </div>

                          {/* TEXTO */}

                          <div className="submission-answer">

                            <span>
                              TEXTO DA REDAÇÃO
                            </span>

                            <p
                              style={{
                                whiteSpace:
                                  "pre-wrap",
                              }}
                            >
                              {submission.text ||
                                "O aluno não escreveu texto no site."}
                            </p>

                          </div>

                          {/* ARQUIVOS */}

                          {submission.attachments &&
                            submission.attachments.length >
                              0 && (

                              <div className="activity-attachments">

                                <span className="activity-attachments-title">
                                  ARQUIVOS DO ALUNO
                                </span>

                                <div className="activity-attachment-list">

                                  {submission.attachments.map(
                                    (
                                      attachment,
                                      index
                                    ) => (

                                      <button
                                        type="button"
                                        className="activity-attachment"
                                        key={
                                          attachment.name +
                                          "-" +
                                          index
                                        }
                                        onClick={() =>
                                          openAttachment(
                                            attachment
                                          )
                                        }
                                      >

                                        <div>

                                          <strong>
                                            {
                                              attachment.name
                                            }
                                          </strong>

                                          <small>
                                            {formatFileSize(
                                              attachment.size
                                            )}
                                          </small>

                                        </div>

                                        <span>
                                          Abrir
                                        </span>

                                      </button>

                                    )
                                  )}

                                </div>

                              </div>

                            )}

                          {/* CORREÇÃO */}

                          <div className="submission-correction">

                            <div className="submission-correction-header">

                              <div>

                                <span>
                                  CORREÇÃO
                                </span>

                                <h3>
                                  Avaliação do professor
                                </h3>

                              </div>

                              {existingCorrection && (

                                <span className="submission-corrected">
                                  CORRIGIDA
                                </span>

                              )}

                            </div>

                            {existingCorrection && (

                              <div className="submission-existing-correction">

                                {existingCorrection.grade !==
                                  null && (

                                  <strong>
                                    Nota:{" "}
                                    {
                                      existingCorrection.grade
                                    }
                                  </strong>

                                )}

                                {existingCorrection.feedback && (

                                  <p>
                                    {
                                      existingCorrection.feedback
                                    }
                                  </p>

                                )}

                              </div>

                            )}

                            {correctionSubmission &&
                            correctionSubmission.id ===
                              submission.id ? (

                              <form
                                className="correction-form"
                                onSubmit={saveCorrection}
                              >

                                <label>

                                  Nota

                                  <input
                                    type="number"
                                    min="0"
                                    max="10"
                                    step="0.1"
                                    value={grade}
                                    onChange={(event) =>
                                      setGrade(
                                        event.target.value
                                      )
                                    }
                                    placeholder="0 a 10"
                                  />

                                </label>

                                <label>

                                  Feedback

                                  <textarea
                                    rows="5"
                                    value={feedback}
                                    onChange={(event) =>
                                      setFeedback(
                                        event.target.value
                                      )
                                    }
                                    placeholder="Escreva um feedback para o aluno."
                                  />

                                </label>

                                <button
                                  type="submit"
                                >
                                  Salvar correção
                                </button>

                              </form>

                            ) : (

                              <button
                                type="button"
                                onClick={() =>
                                  openCorrection(
                                    submission
                                  )
                                }
                              >
                                {existingCorrection
                                  ? "Editar correção"
                                  : "Corrigir redação"}
                              </button>

                            )}

                          </div>

                        </article>

                      );
                    })}

                  </div>

                )}

                <button
                  type="button"
                  className="professor-secondary-button"
                  onClick={() =>
                    setView("detalhes")
                  }
                >
                  Voltar para a proposta
                </button>

              </>

            )}

          </div>

        </section>

      )}

    </main>
  );
}

export default ProfessorRedacoes;