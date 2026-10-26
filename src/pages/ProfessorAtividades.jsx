import { useState } from "react";
import "./ProfessorAtividades.css";

function ProfessorAtividades() {
  const savedUser = localStorage.getItem(
    "minervaLoggedUser"
  );

  const savedActivities = localStorage.getItem(
    "minervaAtividades"
  );

  const savedSubmissions = localStorage.getItem(
    "minervaEntregas"
  );

  const savedUsers = localStorage.getItem(
    "minervaUsers"
  );

  const savedCorrections = localStorage.getItem(
    "minervaCorrecoes"
  );

  const savedActivityFeedbacks =
    localStorage.getItem(
      "minervaFeedbackAtividades"
    );

  let loggedUser = null;
  let initialActivities = [];
  let initialSubmissions = [];
  let initialUsers = [];
  let initialCorrections = [];
  let initialActivityFeedbacks = [];

  try {
    if (savedUser) {
      loggedUser = JSON.parse(savedUser);
    }
  } catch {
    loggedUser = null;
  }

  try {
    if (savedActivities) {
      initialActivities =
        JSON.parse(savedActivities);
    }
  } catch {
    initialActivities = [];
  }

  try {
    if (savedSubmissions) {
      initialSubmissions =
        JSON.parse(savedSubmissions);
    }
  } catch {
    initialSubmissions = [];
  }

  try {
    if (savedUsers) {
      initialUsers = JSON.parse(savedUsers);
    }
  } catch {
    initialUsers = [];
  }

  try {
    if (savedCorrections) {
      initialCorrections =
        JSON.parse(savedCorrections);
    }
  } catch {
    initialCorrections = [];
  }

  try {
    if (savedActivityFeedbacks) {
      initialActivityFeedbacks =
        JSON.parse(
          savedActivityFeedbacks
        );
    }
  } catch {
    initialActivityFeedbacks = [];
  }

  const [activities, setActivities] =
    useState(initialActivities);

  const [submissions] =
    useState(initialSubmissions);

  const [corrections, setCorrections] =
    useState(initialCorrections);

  const [users] =
    useState(initialUsers);

  const [showForm, setShowForm] =
    useState(false);

  const [selectedActivity, setSelectedActivity] =
    useState(null);

  const [showAnalysis, setShowAnalysis] =
    useState(false);

  const [form, setForm] = useState({
    subject: "",
    title: "",
    description: "",
    deadline: "",
  });

  const [attachments, setAttachments] =
    useState([]);

  const [correctionSubmission, setCorrectionSubmission] =
    useState(null);

  const [grade, setGrade] = useState("");

  const [feedback, setFeedback] =
    useState("");

  const [message, setMessage] =
    useState("");

  const professorSubjects =
    loggedUser?.subjects || [];

  function getStudents() {
    return users.filter(function (user) {
      return (
        user.userType === "aluno" &&
        user.status === "ativo"
      );
    });
  }

  function getStudentsFromSubject(
    subjectName
  ) {
    return getStudents().filter(
      function (student) {
        return (
          student.subjects &&
          student.subjects.includes(
            subjectName
          )
        );
      }
    );
  }

  function getActivitySubmissions(
    activityId
  ) {
    return submissions.filter(
      function (submission) {
        return (
          submission.activityId ===
          activityId
        );
      }
    );
  }

  function getCorrection(
    submissionId
  ) {
    return corrections.find(
      function (item) {
        return (
          item.submissionId ===
          submissionId
        );
      }
    );
  }

  function getActivityFeedbacks(
    activityId
  ) {
    return initialActivityFeedbacks
      .filter(function (item) {
        return (
          item.activityId ===
          activityId
        );
      })
      .sort(function (a, b) {
        return (
          new Date(b.submittedAt) -
          new Date(a.submittedAt)
        );
      });
  }

  function getActivityAnalysis(
    activity
  ) {
    const students =
      getStudentsFromSubject(
        activity.subject
      );

    const activitySubmissions =
      getActivitySubmissions(
        activity.id
      );

    const submittedStudentIds =
      activitySubmissions.map(
        function (submission) {
          return String(
            submission.studentId
          );
        }
      );

    const correctedSubmissions =
      activitySubmissions.filter(
        function (submission) {
          return Boolean(
            getCorrection(
              submission.id
            )
          );
        }
      );

    const gradedCorrections =
      correctedSubmissions
        .map(function (submission) {
          return getCorrection(
            submission.id
          );
        })
        .filter(function (correction) {
          return (
            correction &&
            correction.grade !== null &&
            correction.grade !== ""
          );
        });

    let averageGrade = null;

    if (gradedCorrections.length > 0) {
      const total =
        gradedCorrections.reduce(
          function (
            sum,
            correction
          ) {
            return (
              sum +
              Number(
                correction.grade
              )
            );
          },
          0
        );

      averageGrade =
        total /
        gradedCorrections.length;
    }

    const pendingStudents =
      students.filter(
        function (student) {
          return !submittedStudentIds.includes(
            String(student.id)
          );
        }
      );

    return {
      totalStudents:
        students.length,

      submitted:
        activitySubmissions.length,

      pending:
        pendingStudents.length,

      corrected:
        correctedSubmissions.length,

      averageGrade:
        averageGrade,
    };
  }

  function formatDate(dateValue) {
    if (!dateValue) {
      return "";
    }

    const parts =
      dateValue.split("-");

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

  function formatDateTime(
    isoValue
  ) {
    if (!isoValue) {
      return "";
    }

    return new Date(
      isoValue
    ).toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  function formatFileSize(size) {
    if (!size) {
      return "";
    }

    if (size < 1024) {
      return size + " B";
    }

    if (size < 1024 * 1024) {
      return (
        Math.round(
          size / 1024
        ) + " KB"
      );
    }

    return (
      Math.round(
        (size /
          (1024 * 1024)) *
          10
      ) /
        10 +
      " MB"
    );
  }

  function handleFormChange(event) {
    const field =
      event.target.name;

    const value =
      event.target.value;

    setForm(function (previous) {
      return {
        ...previous,
        [field]: value,
      };
    });
  }

  function handleFiles(event) {
    const selectedFiles =
      Array.from(
        event.target.files
      );

    const validFiles = [];

    selectedFiles.forEach(
      function (file) {
        if (
          file.size >
          2 * 1024 * 1024
        ) {
          setMessage(
            "O arquivo " +
              file.name +
              " ultrapassa o limite de 2 MB."
          );

          return;
        }

        validFiles.push(file);
      }
    );

    setAttachments(validFiles);
  }

  function readFile(file) {
    return new Promise(
      function (resolve, reject) {
        const reader =
          new FileReader();

        reader.onload =
          function () {
            resolve({
              name: file.name,
              type: file.type,
              size: file.size,
              dataUrl:
                reader.result,
            });
          };

        reader.onerror =
          function () {
            reject(
              new Error(
                "Erro ao ler arquivo."
              )
            );
          };

        reader.readAsDataURL(file);
      }
    );
  }

  /*
   * Cria notificações para os alunos
   * que cursam a disciplina da atividade.
   */
  function createActivityNotifications(
    activity
  ) {
    const savedNotifications =
      localStorage.getItem(
        "minervaNotificacoes"
      );

    let notifications = [];

    try {
      if (savedNotifications) {
        const parsed =
          JSON.parse(
            savedNotifications
          );

        if (Array.isArray(parsed)) {
          notifications = parsed;
        }
      }
    } catch {
      notifications = [];
    }

    const students =
      getStudentsFromSubject(
        activity.subject
      );

    const newNotifications =
      students.map(
        function (student) {
          return {
            id:
              "notificacao-atividade-" +
              activity.id +
              "-" +
              student.id,

            userId: student.id,

            type:
              "NOVA ATIVIDADE",

            title:
              "Nova atividade de " +
              activity.subject,

            message:
              activity.title,

            activityId:
              activity.id,

            read: false,

            createdAt:
              new Date().toISOString(),
          };
        }
      );

    const filteredNotifications =
      notifications.filter(
        function (notification) {
          return !newNotifications.some(
            function (newNotification) {
              return (
                notification.id ===
                newNotification.id
              );
            }
          );
        }
      );

    const updatedNotifications =
      [
        ...filteredNotifications,
        ...newNotifications,
      ];

    localStorage.setItem(
      "minervaNotificacoes",
      JSON.stringify(
        updatedNotifications
      )
    );
  }

  /*
   * Cria ou atualiza uma notificação
   * quando uma atividade é corrigida.
   */
  function createCorrectionNotification(
    correction,
    activity
  ) {
    const savedNotifications =
      localStorage.getItem(
        "minervaNotificacoes"
      );

    let notifications = [];

    try {
      if (savedNotifications) {
        const parsed =
          JSON.parse(
            savedNotifications
          );

        if (Array.isArray(parsed)) {
          notifications = parsed;
        }
      }
    } catch {
      notifications = [];
    }

    const notificationId =
      "notificacao-correcao-" +
      correction.submissionId;

    const newNotification = {
      id: notificationId,

      userId:
        correction.studentId,

      type:
        "ATIVIDADE CORRIGIDA",

      title:
        "Sua atividade foi corrigida",

      message:
        activity.title,

      activityId:
        activity.id,

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

  async function handleCreateActivity(
    event
  ) {
    event.preventDefault();

    setMessage("");

    if (
      !form.subject ||
      !form.title ||
      !form.description ||
      !form.deadline
    ) {
      setMessage(
        "Preencha todos os campos obrigatórios."
      );

      return;
    }

    try {
      const processedAttachments =
        [];

      for (const file of attachments) {
        const processed =
          await readFile(file);

        processedAttachments.push(
          processed
        );
      }

      const newActivity = {
        id:
          "atividade-" +
          (activities.length + 1),

        subject:
          form.subject,

        title:
          form.title,

        description:
          form.description,

        deadline:
          form.deadline,

        professorId:
          loggedUser?.id || null,

        professorName:
          loggedUser?.name ||
          "Professor",

        attachments:
          processedAttachments,

        createdAt:
          new Date().toISOString(),
      };

      const updatedActivities =
        [
          ...activities,
          newActivity,
        ];

      setActivities(
        updatedActivities
      );

      localStorage.setItem(
        "minervaAtividades",
        JSON.stringify(
          updatedActivities
        )
      );

      createActivityNotifications(
        newActivity
      );

      setForm({
        subject: "",
        title: "",
        description: "",
        deadline: "",
      });

      setAttachments([]);

      setShowForm(false);

      setMessage(
        "Atividade criada com sucesso."
      );
    } catch {
      setMessage(
        "Não foi possível criar a atividade."
      );
    }
  }

  function handleDeleteActivity(
    activityId
  ) {
    const confirmed =
      window.confirm(
        "Tem certeza que deseja excluir esta atividade?"
      );

    if (!confirmed) {
      return;
    }

    const updatedActivities =
      activities.filter(
        function (activity) {
          return (
            activity.id !==
            activityId
          );
        }
      );

    setActivities(
      updatedActivities
    );

    localStorage.setItem(
      "minervaAtividades",
      JSON.stringify(
        updatedActivities
      )
    );

    if (
      selectedActivity &&
      selectedActivity.id ===
        activityId
    ) {
      setSelectedActivity(null);
      setShowAnalysis(false);
    }

    setMessage(
      "Atividade excluída com sucesso."
    );
  }

  function openActivity(
    activity
  ) {
    setSelectedActivity(activity);
    setShowAnalysis(false);
    setCorrectionSubmission(null);
    setGrade("");
    setFeedback("");
    setMessage("");
  }

  function closeActivity() {
    setSelectedActivity(null);
    setShowAnalysis(false);
    setCorrectionSubmission(null);
    setGrade("");
    setFeedback("");
  }

  function openAnalysis(
    activity
  ) {
    setSelectedActivity(activity);
    setShowAnalysis(true);
    setCorrectionSubmission(null);
    setGrade("");
    setFeedback("");
    setMessage("");
  }

  function openCorrection(
    submission
  ) {
    const existingCorrection =
      getCorrection(
        submission.id
      );

    setCorrectionSubmission(
      submission
    );

    if (existingCorrection) {
      setGrade(
        existingCorrection.grade ===
          null
          ? ""
          : String(
              existingCorrection.grade
            )
      );

      setFeedback(
        existingCorrection.feedback ||
          ""
      );
    } else {
      setGrade("");
      setFeedback("");
    }
  }

  function saveCorrection(
    event
  ) {
    event.preventDefault();

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
        Number(grade) < 0 ||
        Number(grade) > 10
      )
    ) {
      setMessage(
        "A nota deve estar entre 0 e 10."
      );

      return;
    }

    const existingCorrection =
      getCorrection(
        correctionSubmission.id
      );

    const newCorrection = {
      id:
        existingCorrection?.id ||
        "correcao-" +
          (corrections.length + 1),

      submissionId:
        correctionSubmission.id,

      activityId:
        correctionSubmission.activityId,

      studentId:
        correctionSubmission.studentId,

      studentName:
        correctionSubmission.studentName,

      grade:
        grade === ""
          ? null
          : Number(grade),

      feedback:
        cleanFeedback,

      professorId:
        loggedUser?.id || null,

      professorName:
        loggedUser?.name ||
        "Professor",

      correctedAt:
        new Date().toISOString(),
    };

    let updatedCorrections;

    if (existingCorrection) {
      updatedCorrections =
        corrections.map(
          function (item) {
            if (
              item.submissionId ===
              correctionSubmission.id
            ) {
              return newCorrection;
            }

            return item;
          }
        );
    } else {
      updatedCorrections = [
        ...corrections,
        newCorrection,
      ];
    }

    setCorrections(
      updatedCorrections
    );

    localStorage.setItem(
      "minervaCorrecoes",
      JSON.stringify(
        updatedCorrections
      )
    );

    const activity =
      activities.find(
        function (item) {
          return (
            item.id ===
            correctionSubmission.activityId
          );
        }
      );

    if (activity) {
      createCorrectionNotification(
        newCorrection,
        activity
      );
    }

    setCorrectionSubmission(
      null
    );

    setGrade("");

    setFeedback("");

    setMessage(
      "Correção salva com sucesso."
    );
  }

  function openAttachment(
    attachment
  ) {
    if (!attachment?.dataUrl) {
      return;
    }

    const newWindow =
      window.open();

    if (!newWindow) {
      return;
    }

    newWindow.document.write(
      "<html>" +
        "<head>" +
        "<title>" +
        attachment.name +
        "</title>" +
        "</head>" +
        "<body style=\"margin:0;background:#0b0b14;\">" +
        "<iframe src=\"" +
        attachment.dataUrl +
        "\" style=\"width:100%;height:100vh;border:none;\"></iframe>" +
        "</body>" +
        "</html>"
    );

    newWindow.document.close();
  }

  const professorActivities =
    activities.filter(
      function (activity) {
        return professorSubjects.includes(
          activity.subject
        );
      }
    );

  return (
    <main className="professor-content">
      <section className="professor-welcome">
        <p className="professor-label">
          ATIVIDADES
        </p>

        <h1>
          Atividades
        </h1>

        <p className="professor-description">
          Crie atividades para suas turmas,
          acompanhe as entregas e faça
          correções.
        </p>
      </section>

      <section className="professor-section">
        <div className="professor-card">
          <div className="professor-section-header">
            <div>
              <span>
                MINHAS ATIVIDADES
              </span>

              <h2>
                Atividades criadas
              </h2>

              <p className="professor-description">
                Crie atividades e acompanhe
                o desempenho dos alunos.
              </p>
            </div>

            <button
              type="button"
              className="professor-primary-button"
              onClick={function () {
                setShowForm(
                  !showForm
                );

                setMessage("");
              }}
            >
              {showForm
                ? "Fechar"
                : "Criar atividade"}
            </button>
          </div>

          {message && (
            <p className="professor-message">
              {message}
            </p>
          )}

          {showForm && (
            <form
              className="professor-form"
              onSubmit={
                handleCreateActivity
              }
            >
              <label>
                Disciplina

                <select
                  name="subject"
                  value={form.subject}
                  onChange={
                    handleFormChange
                  }
                >
                  <option value="">
                    Selecione uma disciplina
                  </option>

                  {professorSubjects.map(
                    function (
                      subject
                    ) {
                      return (
                        <option
                          key={subject}
                          value={
                            subject
                          }
                        >
                          {subject}
                        </option>
                      );
                    }
                  )}
                </select>
              </label>

              <label>
                Título

                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={
                    handleFormChange
                  }
                  placeholder="Ex.: Lista de exercícios"
                />
              </label>

              <label>
                Descrição

                <textarea
                  name="description"
                  value={
                    form.description
                  }
                  onChange={
                    handleFormChange
                  }
                  placeholder="Explique o que os alunos devem fazer."
                  rows="5"
                />
              </label>

              <label>
                Prazo de entrega

                <input
                  type="date"
                  name="deadline"
                  value={
                    form.deadline
                  }
                  onChange={
                    handleFormChange
                  }
                />
              </label>

              <label>
                Anexos

                <input
                  type="file"
                  multiple
                  onChange={
                    handleFiles
                  }
                />

                <small>
                  Cada arquivo pode ter
                  no máximo 2 MB.
                </small>
              </label>

              {attachments.length >
                0 && (
                <div className="activity-file-list">
                  {attachments.map(
                    function (
                      file,
                      index
                    ) {
                      return (
                        <div
                          className="activity-file-item"
                          key={
                            file.name +
                            "-" +
                            index
                          }
                        >
                          <div>
                            <strong>
                              {
                                file.name
                              }
                            </strong>

                            <small>
                              {formatFileSize(
                                file.size
                              )}
                            </small>
                          </div>

                          <button
                            type="button"
                            onClick={function () {
                              setAttachments(
                                attachments.filter(
                                  function (
                                    item,
                                    itemIndex
                                  ) {
                                    return (
                                      itemIndex !==
                                      index
                                    );
                                  }
                                )
                              );
                            }}
                          >
                            Remover
                          </button>
                        </div>
                      );
                    }
                  )}
                </div>
              )}

              <button
                type="submit"
                className="professor-primary-button"
              >
                Criar atividade
              </button>
            </form>
          )}

          <div className="professor-list">
            {professorActivities.length ===
            0 ? (
              <div className="professor-empty">
                <h3>
                  Nenhuma atividade encontrada
                </h3>

                <p>
                  Crie sua primeira atividade
                  para começar.
                </p>
              </div>
            ) : (
              professorActivities.map(
                function (
                  activity
                ) {
                  const activitySubmissions =
                    getActivitySubmissions(
                      activity.id
                    );

                  const activityCorrections =
                    activitySubmissions.filter(
                      function (
                        submission
                      ) {
                        return Boolean(
                          getCorrection(
                            submission.id
                          )
                        );
                      }
                    );

                  return (
                    <article
                      className="professor-list-item"
                      key={
                        activity.id
                      }
                    >
                      <div>
                        <span>
                          {
                            activity.subject
                          }
                        </span>

                        <h3>
                          {
                            activity.title
                          }
                        </h3>

                        <p>
                          Prazo:{" "}
                          {formatDate(
                            activity.deadline
                          )}
                        </p>

                        <p>
                          Entregas:{" "}
                          {
                            activitySubmissions.length
                          }{" "}
                          • Corrigidas:{" "}
                          {
                            activityCorrections.length
                          }
                        </p>

                        <p>
                          Feedbacks:{" "}
                          {
                            getActivityFeedbacks(
                              activity.id
                            ).length
                          }
                        </p>
                      </div>

                      <div className="professor-list-actions">
                        <button
                          type="button"
                          onClick={function () {
                            openActivity(
                              activity
                            );
                          }}
                        >
                          Ver atividade
                        </button>

                        <button
                          type="button"
                          onClick={function () {
                            openAnalysis(
                              activity
                            );
                          }}
                        >
                          Ver análise
                        </button>

                        <button
                          type="button"
                          onClick={function () {
                            handleDeleteActivity(
                              activity.id
                            );
                          }}
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

      {selectedActivity && (
        <section className="professor-section">
          <div className="professor-card">
            <div className="professor-section-header">
              <div>
                <span>
                  {
                    selectedActivity.subject
                  }
                </span>

                <h2>
                  {
                    selectedActivity.title
                  }
                </h2>

                <p className="professor-description">
                  {
                    selectedActivity.description
                  }
                </p>

                <p className="professor-description">
                  Prazo:{" "}
                  {formatDate(
                    selectedActivity.deadline
                  )}
                </p>
              </div>

              <button
                type="button"
                className="professor-secondary-button"
                onClick={
                  closeActivity
                }
              >
                Fechar
              </button>
            </div>

            {selectedActivity.attachments &&
              selectedActivity.attachments.length >
                0 && (
                <div className="activity-attachments">
                  <span className="activity-attachments-title">
                    ANEXOS DA ATIVIDADE
                  </span>

                  <div className="activity-attachment-list">
                    {selectedActivity.attachments.map(
                      function (
                        attachment,
                        index
                      ) {
                        return (
                          <button
                            type="button"
                            className="activity-attachment"
                            key={
                              attachment.name +
                              "-" +
                              index
                            }
                            onClick={function () {
                              openAttachment(
                                attachment
                              );
                            }}
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
                        );
                      }
                    )}
                  </div>
                </div>
              )}

            {(() => {
              const activityFeedbacks =
                getActivityFeedbacks(
                  selectedActivity.id
                );

              return (
                <>
                  <div className="professor-section-header">
                    <div>
                      <span>
                        FEEDBACKS DOS ALUNOS
                      </span>

                      <h2>
                        Dificuldades relatadas
                      </h2>

                      <p className="professor-description">
                        Comentários privados
                        enviados pelos alunos
                        sobre esta atividade.
                      </p>
                    </div>
                  </div>

                  {activityFeedbacks.length ===
                  0 ? (
                    <div className="professor-empty">
                      <h3>
                        Nenhum feedback ainda
                      </h3>

                      <p>
                        Os alunos ainda não
                        enviaram comentários
                        sobre esta atividade.
                      </p>
                    </div>
                  ) : (
                    <div className="submission-list">
                      {activityFeedbacks.map(
                        function (
                          item
                        ) {
                          return (
                            <article
                              className="submission-card"
                              key={
                                item.id
                              }
                            >
                              <div className="submission-header">
                                <div>
                                  <span>
                                    ALUNO
                                  </span>

                                  <h3>
                                    {
                                      item.studentName
                                    }
                                  </h3>

                                  <p>
                                    {
                                      item.studentEmail
                                    }
                                  </p>
                                </div>

                                <span className="submission-status">
                                  {formatDateTime(
                                    item.submittedAt
                                  )}
                                </span>
                              </div>

                              <div className="submission-answer">
                                <span>
                                  COMENTÁRIO
                                </span>

                                <p>
                                  {
                                    item.comment
                                  }
                                </p>
                              </div>
                            </article>
                          );
                        }
                      )}
                    </div>
                  )}
                </>
              );
            })()}

            {showAnalysis ? (
              <>
                <div className="professor-section-header">
                  <div>
                    <span>
                      ANÁLISE
                    </span>

                    <h2>
                      Resultado da atividade
                    </h2>
                  </div>
                </div>

                {(() => {
                  const analysis =
                    getActivityAnalysis(
                      selectedActivity
                    );

                  return (
                    <div className="activity-analysis-grid">
                      <div className="activity-analysis-card">
                        <span>
                          ALUNOS NA TURMA
                        </span>

                        <strong>
                          {
                            analysis.totalStudents
                          }
                        </strong>
                      </div>

                      <div className="activity-analysis-card">
                        <span>
                          ENTREGARAM
                        </span>

                        <strong>
                          {
                            analysis.submitted
                          }
                        </strong>
                      </div>

                      <div className="activity-analysis-card">
                        <span>
                          PENDENTES
                        </span>

                        <strong>
                          {
                            analysis.pending
                          }
                        </strong>
                      </div>

                      <div className="activity-analysis-card">
                        <span>
                          CORRIGIDAS
                        </span>

                        <strong>
                          {
                            analysis.corrected
                          }
                        </strong>
                      </div>

                      <div className="activity-analysis-card">
                        <span>
                          MÉDIA
                        </span>

                        <strong>
                          {analysis.averageGrade ===
                          null
                            ? "-"
                            : analysis.averageGrade.toFixed(
                                1
                              )}
                        </strong>

                        <small>
                          Apenas atividades
                          com nota
                        </small>
                      </div>
                    </div>
                  );
                })()}

                <button
                  type="button"
                  className="professor-secondary-button"
                  onClick={function () {
                    setShowAnalysis(
                      false
                    );
                  }}
                >
                  Voltar para entregas
                </button>
              </>
            ) : (
              <>
                <div className="professor-section-header">
                  <div>
                    <span>
                      ENTREGAS
                    </span>

                    <h2>
                      Respostas dos alunos
                    </h2>
                  </div>
                </div>

                {getActivitySubmissions(
                  selectedActivity.id
                ).length === 0 ? (
                  <div className="professor-empty">
                    <h3>
                      Nenhuma entrega ainda
                    </h3>

                    <p>
                      Os alunos ainda não
                      enviaram esta atividade.
                    </p>
                  </div>
                ) : (
                  <div className="submission-list">
                    {getActivitySubmissions(
                      selectedActivity.id
                    ).map(
                      function (
                        submission
                      ) {
                        const existingCorrection =
                          getCorrection(
                            submission.id
                          );

                        return (
                          <article
                            className="submission-card"
                            key={
                              submission.id
                            }
                          >
                            <div className="submission-header">
                              <div>
                                <span>
                                  ALUNO
                                </span>

                                <h3>
                                  {
                                    submission.studentName
                                  }
                                </h3>

                                <p>
                                  {
                                    submission.studentEmail
                                  }
                                </p>
                              </div>

                              <span className="submission-status">
                                ENVIADA
                              </span>
                            </div>

                            <div className="submission-answer">
                              <span>
                                RESPOSTA
                              </span>

                              <p>
                                {submission.answer ||
                                  "O aluno não escreveu uma resposta."}
                              </p>
                            </div>

                            {submission.attachments &&
                              submission.attachments.length >
                                0 && (
                                <div className="activity-attachments">
                                  <span className="activity-attachments-title">
                                    ANEXOS DO ALUNO
                                  </span>

                                  <div className="activity-attachment-list">
                                    {submission.attachments.map(
                                      function (
                                        attachment,
                                        index
                                      ) {
                                        return (
                                          <button
                                            type="button"
                                            className="activity-attachment"
                                            key={
                                              attachment.name +
                                              "-" +
                                              index
                                            }
                                            onClick={function () {
                                              openAttachment(
                                                attachment
                                              );
                                            }}
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
                                        );
                                      }
                                    )}
                                  </div>
                                </div>
                              )}

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
                                  onSubmit={
                                    saveCorrection
                                  }
                                >
                                  <label>
                                    Nota

                                    <input
                                      type="number"
                                      min="0"
                                      max="10"
                                      step="0.1"
                                      value={
                                        grade
                                      }
                                      onChange={function (
                                        event
                                      ) {
                                        setGrade(
                                          event
                                            .target
                                            .value
                                        );
                                      }}
                                      placeholder="0 a 10"
                                    />
                                  </label>

                                  <label>
                                    Feedback

                                    <textarea
                                      rows="5"
                                      value={
                                        feedback
                                      }
                                      onChange={function (
                                        event
                                      ) {
                                        setFeedback(
                                          event
                                            .target
                                            .value
                                        );
                                      }}
                                      placeholder="Escreva um feedback para o aluno."
                                    />
                                  </label>

                                  <button type="submit">
                                    Salvar correção
                                  </button>
                                </form>
                              ) : (
                                <button
                                  type="button"
                                  onClick={function () {
                                    openCorrection(
                                      submission
                                    );
                                  }}
                                >
                                  {existingCorrection
                                    ? "Editar correção"
                                    : "Corrigir atividade"}
                                </button>
                              )}
                            </div>
                          </article>
                        );
                      }
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      )}
    </main>
  );
}

export default ProfessorAtividades;