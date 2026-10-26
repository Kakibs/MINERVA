import { useState } from "react";
import "./ProfessorCronograma.css";

// ==========================================
// LEITURA DO LOCALSTORAGE
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

function readObject(key) {
  try {
    const saved = localStorage.getItem(key);

    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

// ==========================================
// SALVAR NO LOCALSTORAGE
// ==========================================

function persist(key, value) {
  try {
    localStorage.setItem(
      key,
      JSON.stringify(value)
    );

    return true;
  } catch {
    return false;
  }
}

// ==========================================
// ID DA AULA
// ==========================================

function createClassId(classes) {
  const savedCounter =
    localStorage.getItem(
      "minervaCronogramaCounter"
    );

  let counter = Number(savedCounter);

  if (
    !Number.isInteger(counter) ||
    counter < 0
  ) {
    counter = 0;
  }

  let newId;

  do {
    counter += 1;
    newId = "aula-" + counter;
  } while (
    classes.some(
      (item) => item.id === newId
    )
  );

  localStorage.setItem(
    "minervaCronogramaCounter",
    String(counter)
  );

  return newId;
}

// ==========================================
// DATA E HORA
// ==========================================

function getClassDateTime(item) {
  if (!item?.date || !item?.time) {
    return null;
  }

  const value =
    item.date + "T" + item.time;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

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

function formatDayAndTime(item) {
  const date = getClassDateTime(item);

  if (!date) {
    return item?.time || "";
  }

  return (
    date.toLocaleDateString(
      "pt-BR",
      {
        weekday: "long",
      }
    ) +
    " • " +
    item.time
  );
}

// ==========================================
// NOTIFICAÇÕES
// ==========================================

function createClassNotifications(
  newClass
) {
  const users = readList(
    "minervaUsers"
  );

  const savedNotifications =
    readList(
      "minervaNotificacoes"
    );

  const students = users.filter(
    (user) =>
      user.userType === "aluno" &&
      user.status === "ativo" &&
      Array.isArray(user.subjects) &&
      user.subjects.includes(
        newClass.subject
      )
  );

  const newNotifications =
    students.map(function (student) {
      return {
        id:
          "notificacao-aula-" +
          newClass.id +
          "-" +
          student.id,

        userId:
          student.id,

        type:
          "NOVA AULA",

        title:
          "Nova aula adicionada",

        message:
          newClass.subject +
          " • " +
          formatDate(newClass.date) +
          " às " +
          newClass.time +
          " • " +
          newClass.room,

        classId:
          newClass.id,

        read: false,

        createdAt:
          new Date().toISOString(),
      };
    });

  if (
    newNotifications.length === 0
  ) {
    return;
  }

  const filteredNotifications =
    savedNotifications.filter(
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

  const updatedNotifications = [
    ...filteredNotifications,
    ...newNotifications,
  ];

  persist(
    "minervaNotificacoes",
    updatedNotifications
  );
}

// ==========================================
// COMPONENTE
// ==========================================

function ProfessorCronograma() {
  const loggedUser =
    readObject(
      "minervaLoggedUser"
    );

  const professorSubjects =
    loggedUser?.subjects || [];

  const [classes, setClasses] =
    useState(() =>
      readList(
        "minervaCronograma"
      )
    );

  const [activities] =
    useState(() =>
      readList(
        "minervaAtividades"
      )
    );

  const [showForm, setShowForm] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [form, setForm] =
    useState({
      subject: "",
      date: "",
      time: "",
      room: "",
      description: "",
    });

  // ==========================================
  // AULAS DO PROFESSOR
  // ==========================================

  const professorClasses =
    classes.filter(
      (item) =>
        item.professorId ===
          loggedUser?.id ||
        (
          !item.professorId &&
          professorSubjects.includes(
            item.subject
          )
        )
    );

  // ==========================================
  // PRÓXIMAS AULAS
  // ==========================================

  const now = new Date();

  const upcomingClasses =
    professorClasses
      .filter(function (item) {
        const date =
          getClassDateTime(item);

        return (
          date &&
          date >= now
        );
      })
      .sort(function (a, b) {
        return (
          getClassDateTime(a) -
          getClassDateTime(b)
        );
      });

  const nextClass =
    upcomingClasses[0] || null;

  // ==========================================
  // ATIVIDADES DA SEMANA
  // ==========================================

  function getStartOfWeek(date) {
    const result =
      new Date(date);

    const day =
      result.getDay();

    const difference =
      day === 0
        ? -6
        : 1 - day;

    result.setDate(
      result.getDate() +
        difference
    );

    result.setHours(
      0,
      0,
      0,
      0
    );

    return result;
  }

  function getEndOfWeek(date) {
    const result =
      new Date(
        getStartOfWeek(date)
      );

    result.setDate(
      result.getDate() + 6
    );

    result.setHours(
      23,
      59,
      59,
      999
    );

    return result;
  }

  const startOfWeek =
    getStartOfWeek(now);

  const endOfWeek =
    getEndOfWeek(now);

  const weeklyActivities =
    activities.filter(
      function (activity) {
        if (
          !professorSubjects.includes(
            activity.subject
          )
        ) {
          return false;
        }

        if (!activity.deadline) {
          return false;
        }

        const deadline =
          new Date(
            activity.deadline +
              "T23:59:59"
          );

        return (
          deadline >=
            startOfWeek &&
          deadline <=
            endOfWeek
        );
      }
    );

  // ==========================================
  // FORMULÁRIO
  // ==========================================

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

  // ==========================================
  // AGENDAR AULA
  // ==========================================

  function handleCreateClass(
    event
  ) {
    event.preventDefault();

    setMessage("");

    if (
      !form.subject ||
      !form.date ||
      !form.time ||
      !form.room.trim() ||
      !form.description.trim()
    ) {
      setMessage(
        "Preencha disciplina, data, horário, sala e conteúdo da aula."
      );

      return;
    }

    const newClass = {
      id: createClassId(
        classes
      ),

      subject:
        form.subject,

      date:
        form.date,

      time:
        form.time,

      room:
        form.room.trim(),

      description:
        form.description.trim(),

      professorId:
        loggedUser?.id || null,

      professorName:
        loggedUser?.name ||
        "Professor",

      createdAt:
        new Date().toISOString(),
    };

    const updatedClasses = [
      ...classes,
      newClass,
    ];

    if (
      !persist(
        "minervaCronograma",
        updatedClasses
      )
    ) {
      setMessage(
        "Não foi possível salvar a aula."
      );

      return;
    }

    setClasses(
      updatedClasses
    );

    createClassNotifications(
      newClass
    );

    setForm({
      subject: "",
      date: "",
      time: "",
      room: "",
      description: "",
    });

    setShowForm(false);

    setMessage(
      "Aula agendada com sucesso."
    );
  }

  // ==========================================
  // EXCLUIR AULA
  // ==========================================

  function handleDeleteClass(
    classId
  ) {
    const confirmed =
      window.confirm(
        "Tem certeza que deseja excluir esta aula?"
      );

    if (!confirmed) {
      return;
    }

    const updatedClasses =
      classes.filter(
        (item) =>
          item.id !== classId
      );

    if (
      !persist(
        "minervaCronograma",
        updatedClasses
      )
    ) {
      setMessage(
        "Não foi possível excluir a aula."
      );

      return;
    }

    setClasses(
      updatedClasses
    );

    setMessage(
      "Aula excluída com sucesso."
    );
  }

  return (
    <main className="professor-content professor-cronograma-page">

      {/* ======================================
          CABEÇALHO
      ====================================== */}

      <section className="professor-welcome">

        <p className="professor-label">
          CRONOGRAMA
        </p>

        <h1>
          Meu cronograma
        </h1>

        <p className="professor-description">
          Organize suas aulas, horários,
          salas e conteúdos da turma.
        </p>

      </section>

      {/* ======================================
          CARDS
      ====================================== */}

      <section className="professor-grid">

        <div className="professor-card">

          <span>
            AULAS PROGRAMADAS
          </span>

          <h2>
            {professorClasses.length}
          </h2>

          <p>
            Aulas presenciais
            cadastradas no cronograma.
          </p>

        </div>

        <div className="professor-card">

          <span>
            PRÓXIMA AULA
          </span>

          {nextClass ? (

            <>

              <h2>
                {formatDate(
                  nextClass.date
                )}
              </h2>

              <p>
                {nextClass.time}
                {" • "}
                {nextClass.room}
              </p>

            </>

          ) : (

            <>

              <h2>
                —
              </h2>

              <p>
                Nenhuma próxima aula
                cadastrada.
              </p>

            </>

          )}

        </div>

        <div className="professor-card">

          <span>
            ATIVIDADES
          </span>

          <h2>
            {weeklyActivities.length}
          </h2>

          <p>
            Atividades com prazo
            nesta semana.
          </p>

        </div>

      </section>

      {/* ======================================
          LISTA DE AULAS
      ====================================== */}

      <section className="professor-section">

        <div className="section-header">

          <div>

            <h2>
              Próximas aulas
            </h2>

            <p className="professor-description">
              Cadastre e organize as aulas
              presenciais das suas disciplinas.
            </p>

          </div>

          <button
            type="button"
            onClick={() => {
              setShowForm(
                !showForm
              );

              setMessage("");
            }}
          >
            {showForm
              ? "Fechar"
              : "+ Agendar aula"}
          </button>

        </div>

        {message && (
          <p className="professor-message">
            {message}
          </p>
        )}

        {/* ==================================
            FORMULÁRIO
        ================================== */}

        {showForm && (

          <form
            className="professor-form"
            onSubmit={
              handleCreateClass
            }
          >

            <label>

              Disciplina

              <select
                name="subject"
                value={
                  form.subject
                }
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
                        key={
                          subject
                        }
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

              Data

              <input
                type="date"
                name="date"
                value={
                  form.date
                }
                onChange={
                  handleFormChange
                }
              />

            </label>

            <label>

              Horário

              <input
                type="time"
                name="time"
                value={
                  form.time
                }
                onChange={
                  handleFormChange
                }
              />

            </label>

            <label>

              Sala

              <input
                type="text"
                name="room"
                value={
                  form.room
                }
                onChange={
                  handleFormChange
                }
                placeholder="Ex.: Sala 3B"
              />

            </label>

            <label>

              Conteúdo da aula

              <input
                type="text"
                name="description"
                value={
                  form.description
                }
                onChange={
                  handleFormChange
                }
                placeholder="Ex.: Função quadrática"
              />

            </label>

            <button
              type="submit"
            >
              Agendar aula
            </button>

          </form>

        )}

        {/* ==================================
            AULAS
        ================================== */}

        {upcomingClasses.length === 0 ? (

          <div className="professor-empty">

            <h3>
              Nenhuma próxima aula
            </h3>

            <p>
              Cadastre uma aula para
              começar a montar o cronograma.
            </p>

          </div>

        ) : (

          <ul className="professor-list">

            {upcomingClasses.map(
              function (item) {

                return (
                  <li
                    key={
                      item.id
                    }
                  >

                    <div>

                      <span>
                        {formatDayAndTime(
                          item
                        )}
                      </span>

                      <p>
                        {item.subject}
                        {" — "}
                        {item.description}
                      </p>

                      <small>
                        {formatDate(
                          item.date
                        )}
                        {" • "}
                        {item.time}
                      </small>

                    </div>

                    <div
                      style={{
                        display:
                          "flex",
                        alignItems:
                          "center",
                        gap:
                          "12px",
                      }}
                    >

                      <span>
                        {item.room}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteClass(
                            item.id
                          )
                        }
                      >
                        Excluir
                      </button>

                    </div>

                  </li>
                );
              }
            )}

          </ul>

        )}

      </section>

    </main>
  );
}

export default ProfessorCronograma;