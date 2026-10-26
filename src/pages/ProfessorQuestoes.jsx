import { useState } from "react";
import "./ProfessorQuestoes.css";

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

// Remove espaços extras
function cleanText(text) {
  return String(text).trim().replace(/\s+/g, " ");
}

// Compara textos ignorando maiúsculas e acentos
function compareKey(text) {
  return cleanText(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

const LETTERS = ["a", "b", "c", "d"];

const EMPTY_FORM = {
  subject: "",
  topic: "",
  statement: "",
  options: {
    a: "",
    b: "",
    c: "",
    d: "",
  },
  correct: "",
  explanation: "",
};

function ProfessorQuestoes() {
  const loggedUser = readObject("minervaLoggedUser");

  const professorSubjects = loggedUser?.subjects || [];

  const [questoes, setQuestoes] = useState(() =>
    readList("minervaQuestoes")
  );

  const [answers, setAnswers] = useState(() =>
    readList("minervaRespostasQuestoes")
  );

  const [showForm, setShowForm] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [message, setMessage] = useState("");

  // Questões das disciplinas do professor
  const professorQuestoes = questoes.filter((item) =>
    professorSubjects.includes(item.subject)
  );

  const selected =
    professorQuestoes.find((item) => item.id === selectedId) || null;

  // Assuntos já utilizados
  const topicSuggestions = [
    ...new Set(
      questoes
        .filter((item) => item.subject === form.subject)
        .map((item) => item.topic)
    ),
  ];

  // Alternativas preenchidas
  const filledLetters = LETTERS.filter((letter) =>
    form.options[letter].trim()
  );

  function getQuestionAnswers(questionId) {
    return answers
      .filter((item) => item.questionId === questionId)
      .sort(
        (a, b) =>
          new Date(b.answeredAt) - new Date(a.answeredAt)
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

  function shorten(text, max) {
    if (!text) {
      return "";
    }

    return text.length > max
      ? text.slice(0, max).trim() + "…"
      : text;
  }

  function handleFormChange(event) {
    const field = event.target.name;
    const value = event.target.value;

    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function handleOptionChange(letter, value) {
    setForm((previous) => {
      const options = {
        ...previous.options,
        [letter]: value,
      };

      let correct = previous.correct;

      // Se a alternativa correta foi apagada,
      // remove também a seleção de correta.
      if (previous.correct === letter && !value.trim()) {
        correct = "";
      }

      return {
        ...previous,
        options,
        correct,
      };
    });
  }

  function handleCreate(event) {
    event.preventDefault();
    setMessage("");

    if (
      !form.subject ||
      !cleanText(form.topic) ||
      !form.statement.trim()
    ) {
      setMessage("Preencha disciplina, assunto e enunciado.");
      return;
    }

    if (filledLetters.length < 2) {
      setMessage("Preencha pelo menos duas alternativas.");
      return;
    }

    if (!form.correct || !filledLetters.includes(form.correct)) {
      setMessage("Escolha qual é a alternativa correta.");
      return;
    }

    const typedTopic = cleanText(form.topic);

    // Reaproveita a grafia de um assunto já existente
    const existingTopic = questoes.find(
      (item) =>
        item.subject === form.subject &&
        compareKey(item.topic) === compareKey(typedTopic)
    )?.topic;

    // Cria a questão
    const newQuestao = {
      id: crypto.randomUUID(),
      subject: form.subject,
      topic: existingTopic || typedTopic,
      statement: form.statement.trim(),

      options: filledLetters.map((letter) => ({
        id: letter,
        text: form.options[letter].trim(),
      })),

      correctOptionId: form.correct,
      explanation: form.explanation.trim(),

      professorId: loggedUser?.id || null,
      professorName: loggedUser?.name || "Professor",

      createdAt: new Date().toISOString(),
    };

    const updated = [...questoes, newQuestao];

    if (!persist("minervaQuestoes", updated)) {
      setMessage("Não foi possível salvar a questão.");
      return;
    }

    setQuestoes(updated);

    setForm({
      subject: "",
      topic: "",
      statement: "",
      options: {
        a: "",
        b: "",
        c: "",
        d: "",
      },
      correct: "",
      explanation: "",
    });

    setShowForm(false);
    setMessage("Questão criada com sucesso.");
  }

  function handleDelete(questionId) {
    const confirmed = window.confirm(
      "Tem certeza que deseja excluir esta questão? As respostas dos alunos a ela também serão apagadas."
    );

    if (!confirmed) {
      return;
    }

    const updatedQuestoes = questoes.filter(
      (item) => item.id !== questionId
    );

    const updatedAnswers = answers.filter(
      (item) => item.questionId !== questionId
    );

    const savedQuestoes = persist(
      "minervaQuestoes",
      updatedQuestoes
    );

    const savedAnswers = persist(
      "minervaRespostasQuestoes",
      updatedAnswers
    );

    if (!savedQuestoes || !savedAnswers) {
      setMessage("Não foi possível excluir a questão.");
      return;
    }

    setQuestoes(updatedQuestoes);
    setAnswers(updatedAnswers);

    if (selectedId === questionId) {
      setSelectedId(null);
    }

    setMessage("Questão excluída com sucesso.");
  }

  return (
   <main className="professor-content professor-questions-page">
      <section className="professor-welcome">
        <p className="professor-label">QUESTÕES</p>

        <h1>Questões</h1>

        <p className="professor-description">
          Crie questões de múltipla escolha e acompanhe os
          acertos e erros dos alunos.
        </p>
      </section>

      <section className="professor-section">
        <div className="professor-card">
          <div className="professor-section-header">
            <div>
              <span>MINHAS QUESTÕES</span>

              <h2>Questões criadas</h2>

              <p className="professor-description">
                Cada questão possui um assunto para que o
                Minerva consiga identificar quais conteúdos
                precisam de mais atenção.
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
              {showForm ? "Fechar" : "Criar questão"}
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
              onSubmit={handleCreate}
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

                  {professorSubjects.map((subject) => (
                    <option
                      key={subject}
                      value={subject}
                    >
                      {subject}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Assunto

                <input
                  type="text"
                  name="topic"
                  list="topic-suggestions"
                  value={form.topic}
                  onChange={handleFormChange}
                  placeholder="Ex.: Função quadrática"
                />

                <datalist id="topic-suggestions">
                  {topicSuggestions.map((topic) => (
                    <option
                      key={topic}
                      value={topic}
                    />
                  ))}
                </datalist>

                <small>
                  Use o mesmo nome para questões do mesmo
                  assunto. Assim a análise consegue agrupar
                  os resultados corretamente.
                </small>
              </label>

              <label>
                Enunciado

                <textarea
                  name="statement"
                  value={form.statement}
                  onChange={handleFormChange}
                  placeholder="Escreva a pergunta."
                  rows="4"
                />
              </label>

              {LETTERS.map((letter) => (
                <label key={letter}>
                  {`Alternativa ${letter.toUpperCase()}${
                    letter === "a" || letter === "b"
                      ? ""
                      : " (opcional)"
                  }`}

                  <input
                    type="text"
                    value={form.options[letter]}
                    onChange={(event) =>
                      handleOptionChange(
                        letter,
                        event.target.value
                      )
                    }
                  />
                </label>
              ))}

              <label>
                Alternativa correta

                <select
                  name="correct"
                  value={form.correct}
                  onChange={handleFormChange}
                >
                  <option value="">
                    Selecione
                  </option>

                  {filledLetters.map((letter) => (
                    <option
                      key={letter}
                      value={letter}
                    >
                      {letter.toUpperCase()}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Explicação da resposta (opcional)

                <textarea
                  name="explanation"
                  value={form.explanation}
                  onChange={handleFormChange}
                  placeholder="O aluno vê isso depois de responder."
                  rows="3"
                />
              </label>

              <button
                type="submit"
                className="professor-primary-button"
              >
                Criar questão
              </button>
            </form>
          )}

          <div className="professor-list">
            {professorQuestoes.length === 0 ? (
              <div className="professor-empty">
                <h3>Nenhuma questão encontrada</h3>

                <p>
                  Crie sua primeira questão para começar.
                </p>
              </div>
            ) : (
              professorQuestoes.map((questao) => {
                const questionAnswers =
                  getQuestionAnswers(questao.id);

                const correctCount =
                  questionAnswers.filter(
                    (item) => item.isCorrect
                  ).length;

                return (
                  <article
                    className="professor-list-item"
                    key={questao.id}
                  >
                    <div>
                      <span>
                        {questao.subject} • {questao.topic}
                      </span>

                      <h3>
                        {shorten(
                          questao.statement,
                          110
                        )}
                      </h3>

                      <p>
                        {questionAnswers.length === 0
                          ? "Sem respostas ainda"
                          : `Respostas: ${questionAnswers.length} • Acertos: ${correctCount}`}
                      </p>
                    </div>

                    <div className="professor-list-actions">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedId(questao.id)
                        }
                      >
                        Ver resultados
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(questao.id)
                        }
                      >
                        Excluir
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>
      </section>

      {selected && (
        <section className="professor-section">
          <div className="professor-card">
            <div className="professor-section-header">
              <div>
                <span>
                  {selected.subject} • {selected.topic}
                </span>

                <h2>Resultados da questão</h2>

                <p
                  className="professor-description"
                  style={{ whiteSpace: "pre-wrap" }}
                >
                  {selected.statement}
                </p>
              </div>

              <button
                type="button"
                className="professor-secondary-button"
                onClick={() => setSelectedId(null)}
              >
                Fechar
              </button>
            </div>

            {(() => {
              const questionAnswers =
                getQuestionAnswers(selected.id);

              const correctCount =
                questionAnswers.filter(
                  (item) => item.isCorrect
                ).length;

              return (
                <>
                  <div className="activity-attachments">
                    <span className="activity-attachments-title">
                      ALTERNATIVAS
                    </span>

                    <div className="activity-file-list">
                      {selected.options.map((option) => {
                        const isCorrect =
                          option.id ===
                          selected.correctOptionId;

                        const count =
                          questionAnswers.filter(
                            (item) =>
                              item.selectedOptionId ===
                              option.id
                          ).length;

                        const details = [];

                        if (isCorrect) {
                          details.push(
                            "Alternativa correta"
                          );
                        }

                        if (questionAnswers.length > 0) {
                          details.push(
                            count === 1
                              ? "1 resposta"
                              : `${count} respostas`
                          );
                        }

                        return (
                          <div
                            className="activity-file-item"
                            key={option.id}
                            style={
                              isCorrect
                                ? {
                                    borderColor:
                                      "rgba(34, 197, 94, 0.4)",
                                  }
                                : undefined
                            }
                          >
                            <div>
                              <strong
                                style={{
                                  whiteSpace: "normal",
                                }}
                              >
                                {option.id.toUpperCase()}){" "}
                                {option.text}
                              </strong>

                              {details.length > 0 && (
                                <small>
                                  {details.join(" • ")}
                                </small>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {selected.explanation && (
                    <div className="submission-answer">
                      <span>EXPLICAÇÃO</span>

                      <p>
                        {selected.explanation}
                      </p>
                    </div>
                  )}

                  <div className="professor-section-header">
                    <div>
                      <span>
                        RESPOSTAS DOS ALUNOS
                      </span>

                      <h2>
                        {questionAnswers.length === 0
                          ? "Sem respostas"
                          : `${correctCount} de ${questionAnswers.length} acertaram (${Math.round(
                              (correctCount /
                                questionAnswers.length) *
                                100
                            )}%)`}
                      </h2>
                    </div>
                  </div>

                  {questionAnswers.length === 0 ? (
                    <div className="professor-empty">
                      <h3>
                        Nenhuma resposta ainda
                      </h3>

                      <p>
                        Os alunos ainda não responderam
                        esta questão.
                      </p>
                    </div>
                  ) : (
                    <div className="submission-list">
                      {questionAnswers.map((item) => {
                        const chosen =
                          selected.options.find(
                            (option) =>
                              option.id ===
                              item.selectedOptionId
                          );

                        return (
                          <article
                            className="submission-card"
                            key={item.id}
                          >
                            <div className="submission-header">
                              <div>
                                <span>ALUNO</span>

                                <h3>
                                  {item.studentName}
                                </h3>

                                <p>
                                  {item.studentEmail}
                                </p>
                              </div>

                              <span
                                className="submission-status"
                                style={
                                  item.isCorrect
                                    ? undefined
                                    : {
                                        color: "#fca5a5",
                                        borderColor:
                                          "rgba(239, 68, 68, 0.25)",
                                        background:
                                          "rgba(239, 68, 68, 0.06)",
                                      }
                                }
                              >
                                {item.isCorrect
                                  ? "ACERTOU"
                                  : "ERROU"}
                              </span>
                            </div>

                            <div className="submission-answer">
                              <span>
                                ESCOLHEU •{" "}
                                {formatDateTime(
                                  item.answeredAt
                                )}
                              </span>

                              <p>
                                {item.selectedOptionId.toUpperCase()}
                                ){" "}
                                {chosen
                                  ? chosen.text
                                  : ""}
                              </p>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </section>
      )}
    </main>
  );
}

export default ProfessorQuestoes;