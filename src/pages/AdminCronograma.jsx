import { useState } from "react";
import "./AdminCronograma.css";
import subjects from "../data/subjects";

function AdminCronograma() {
const [classes, setClasses] = useState(() => {
const savedClasses = localStorage.getItem(
"minervaCronograma"
);

if (!savedClasses) {
  return [];
}

try {
  return JSON.parse(savedClasses);
} catch {
  return [];
}

});

const [showForm, setShowForm] = useState(false);

const [subject, setSubject] = useState("");
const [date, setDate] = useState("");
const [time, setTime] = useState("");
const [room, setRoom] = useState("");
const [description, setDescription] = useState("");

const [error, setError] = useState("");

function handleCreateClass(event) {
event.preventDefault();

setError("");

if (
  !subject ||
  !date ||
  !time ||
  !room.trim()
) {
  setError("Preencha todos os campos obrigatórios.");
  return;
}

const newClass = {
  id: Date.now(),
  subject,
  date,
  time,
  room: room.trim(),
  description: description.trim(),
};

const updatedClasses = [
  ...classes,
  newClass,
];

setClasses(updatedClasses);

localStorage.setItem(
  "minervaCronograma",
  JSON.stringify(updatedClasses)
);

setSubject("");
setDate("");
setTime("");
setRoom("");
setDescription("");

setShowForm(false);

}

function handleDeleteClass(classId) {
const updatedClasses = classes.filter(
(item) => item.id !== classId
);

setClasses(updatedClasses);

localStorage.setItem(
  "minervaCronograma",
  JSON.stringify(updatedClasses)
);

}

function formatDate(dateValue) {
if (!dateValue) {
return "";
}

const [year, month, day] =
  dateValue.split("-");

return `${day}/${month}/${year}`;

}

return (
<main className="admin-content admin-cronograma">

  <section className="admin-welcome">

    <p className="admin-label">
      CRONOGRAMA
    </p>

    <h1>
      Cronograma
    </h1>

    <p className="admin-description">
      Organize as aulas, horários e salas do Minerva.
    </p>

  </section>

  <section className="admin-section">

    <div className="section-header">

      <div>
        <h2>
          Aulas
        </h2>

        <p className="admin-description">
          Crie e gerencie as aulas das disciplinas.
        </p>
      </div>

      <button
        type="button"
        onClick={() => {
          setShowForm(true);
          setError("");
        }}
      >
        Criar aula
      </button>

    </div>

    {showForm && (
      <div className="admin-card">

        <div className="section-header">

          <h2>
            Nova aula
          </h2>

          <button
            type="button"
            onClick={() => {
              setShowForm(false);
              setError("");
            }}
          >
            Fechar
          </button>

        </div>

        <form
          className="login-form"
          onSubmit={handleCreateClass}
        >

          <label>
            Disciplina

            <select
              value={subject}
              onChange={(event) =>
                setSubject(event.target.value)
              }
            >
              <option value="">
                Selecione uma disciplina
              </option>

              {subjects.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label>
            Data

            <input
              type="date"
              value={date}
              onChange={(event) =>
                setDate(event.target.value)
              }
            />
          </label>

          <label>
            Horário

            <input
              type="time"
              value={time}
              onChange={(event) =>
                setTime(event.target.value)
              }
            />
          </label>

          <label>
            Sala

            <input
              type="text"
              placeholder="Ex.: Sala 3B"
              value={room}
              onChange={(event) =>
                setRoom(event.target.value)
              }
            />
          </label>

          <label>
            Descrição

            <textarea
              placeholder="Ex.: Revisão de funções"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              rows="4"
            />
          </label>

          {error && (
            <p className="login-error">
              {error}
            </p>
          )}

          <button
            type="submit"
          >
            Criar aula
          </button>

        </form>

      </div>
    )}

    {classes.length === 0 ? (

      <p className="admin-description">
        Nenhuma aula cadastrada ainda.
      </p>

    ) : (

      <ul className="admin-list">

        {classes.map((item) => (

          <li key={item.id}>

            <div>

              <span>
                DISCIPLINA
              </span>

              <p>
                {item.subject}
              </p>

              {item.description && (
                <small>
                  {item.description}
                </small>
              )}

            </div>

            <div>

              <span>
                DATA E HORÁRIO
              </span>

              <p>
                {formatDate(item.date)}
              </p>

              <small>
                {item.time}
              </small>

            </div>

            <div>

              <span>
                SALA
              </span>

              <p>
                {item.room}
              </p>

            </div>

            <div>

              <button
                type="button"
                onClick={() =>
                  handleDeleteClass(item.id)
                }
              >
                Excluir
              </button>

            </div>

          </li>

        ))}

      </ul>

    )}

  </section>

</main>

);
}

export default AdminCronograma;