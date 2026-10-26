import "./Questoes.css";
import { useState } from "react";

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

function persist(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function Questoes() {
  const user = readObject("minervaLoggedUser");
  const studentSubjects = user?.subjects || [];

  const [questoes] = useState(() => readList("minervaQuestoes"));
  const [answers, setAnswers] = useState(() =>
    readList("minervaRespostasQuestoes")
  );

  const [selectedId, setSelectedId] = useState(null);
  const [chosenOption, setChosenOption] = useState("");
  const [error, setError] = useState("");

  // Por disciplina: o aluno vê as questões das disciplinas dele
  const studentQuestoes = questoes.filter((item) =>
    studentSubjects.includes(item.subject)
  );

  const selected =
    studentQuestoes.find((item) => item.id === selectedId) || null;

  function getAnswer(questionId) {
    return answers.find(
      (item) =>
        item.questionId === questionId && item.studentId === user?.id
    );
  }

  function shorten(text, max) {
    return text.length > max ? text.slice(0, max).trim() + "…" : text;
  }

  function openQuestion(questao) {
    setSelectedId(questao.id);
    setChosenOption("");
    setError("");
  }

  function closePanel() {
    setSelectedId(null);
    setChosenOption("");
    setError("");
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!selected) {
      return;
    }

    if (!user?.id) {
      setError("Não foi possível identificar o aluno logado.");
      return;
    }

    // A resposta não pode ser trocada depois de confirmada
    if (getAnswer(selected.id)) {
      return;
    }

    if (!chosenOption) {
      setError("Escolha uma alternativa antes de confirmar.");
      return;
    }

    const newAnswer = {
      id: "resposta-" + selected.id + "-" + user.id,
      questionId: selected.id,
      subject: selected.subject,
      topic: selected.topic,
      studentId: user.id,
      studentName: user.name || "Aluno",
      studentEmail: user.email || "",
      selectedOptionId: chosenOption,
      isCorrect: chosenOption === selected.correctOptionId,
      answeredAt: new Date().toISOString(),
    };

    const updated = [...answers, newAnswer];

    if (!persist("minervaRespostasQuestoes", updated)) {
      setError("Não foi possível salvar sua resposta.");
      return;
    }

    setAnswers(updated);
    setChosenOption("");
  }

  return (
    <main className="page questions-page">
      <section className="page-header">
        <p className="page-label">QUESTÕES</p>

        <h1>Minhas questões</h1>

        <p>
          Responda as questões das disciplinas que você está cursando.
        </p>
      </section>

      <section className="content-section">
        {studentQuestoes.length === 0 ? (
          <div className="empty-state">
            <h2>Nenhuma questão</h2>

            <p>
              Ainda não existem questões para as disciplinas que você está
              cursando.
            </p>
          </div>
        ) : (
          <div className="activity-list">
            {studentQuestoes.map((questao) => {
              const answer = getAnswer(questao.id);

              return (
                <article className="activity-card" key={questao.id}>
                  <div className="activity-main">
                    <span className="activity-subject">
                      {questao.subject} • {questao.topic}
                    </span>

                    <h2>{shorten(questao.statement, 120)}</h2>
                  </div>

                  <div className="activity-meta">
                    <span>STATUS</span>

                    {answer ? (
                      <>
                        <strong className="activity-submitted-label">
                          ✓ Respondida
                        </strong>

                        <small>
                          {answer.isCorrect ? "Você acertou" : "Você errou"}
                        </small>
                      </>
                    ) : (
                      <small>Não respondida</small>
                    )}

                    <button
                      type="button"
                      className="activity-submit-button"
                      onClick={() => openQuestion(questao)}
                    >
                      {answer ? "Ver resultado" : "Responder questão"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {selected && (
        <section className="content-section">
          <div className="activity-submit-panel">
            <div className="activity-submit-header">
              <div>
                <span>
                  {selected.subject} • {selected.topic}
                </span>

                <h2 style={{ whiteSpace: "pre-wrap" }}>
                  {selected.statement}
                </h2>
              </div>

              <button type="button" onClick={closePanel}>
                Fechar
              </button>
            </div>

            {(() => {
              const answer = getAnswer(selected.id);

              // Já respondeu: mostra o resultado e o gabarito
              if (answer) {
                const correctOption = selected.options.find(
                  (option) => option.id === selected.correctOptionId
                );

                return (
                  <>
                    <div className="student-existing-submission">
                      <span>RESULTADO</span>

                      <p>
                        {answer.isCorrect
                          ? "Você acertou."
                          : "Você errou. A alternativa correta é " +
                            selected.correctOptionId.toUpperCase() +
                            (correctOption
                              ? ") " + correctOption.text
                              : "") +
                            "."}
                      </p>
                    </div>

                    <div className="activity-file-list">
                      {selected.options.map((option) => {
                        const isCorrect =
                          option.id === selected.correctOptionId;

                        const isChosen = option.id === answer.selectedOptionId;

                        const tags = [];

                        if (isChosen) {
                          tags.push("Sua resposta");
                        }

                        if (isCorrect) {
                          tags.push("Alternativa correta");
                        }

                        return (
                          <div
                            className="activity-file-item"
                            key={option.id}
                            style={
                              isCorrect
                                ? { borderColor: "rgba(34, 197, 94, 0.4)" }
                                : isChosen
                                  ? { borderColor: "rgba(239, 68, 68, 0.4)" }
                                  : undefined
                            }
                          >
                            <div>
                              <strong style={{ whiteSpace: "normal" }}>
                                {option.id.toUpperCase()}) {option.text}
                              </strong>

                              {tags.length > 0 && (
                                <small>{tags.join(" • ")}</small>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {selected.explanation && (
                      <div className="student-correction-feedback">
                        <span>EXPLICAÇÃO</span>

                        <p>{selected.explanation}</p>
                      </div>
                    )}
                  </>
                );
              }

              // Ainda não respondeu: mostra as alternativas para escolher
              return (
                <form
                  className="activity-submit-form"
                  onSubmit={handleSubmit}
                >
                  <div className="activity-attachment-list">
                    {selected.options.map((option) => {
                      const isChosen = chosenOption === option.id;

                      return (
                        <button
                          type="button"
                          className="activity-attachment"
                          key={option.id}
                          aria-pressed={isChosen}
                          style={
                            isChosen
                              ? {
                                  borderColor: "#7c3aed",
                                  background: "#151528",
                                }
                              : undefined
                          }
                          onClick={() => {
                            setChosenOption(option.id);
                            setError("");
                          }}
                        >
                          <div>
                            <strong style={{ whiteSpace: "normal" }}>
                              {option.id.toUpperCase()}) {option.text}
                            </strong>
                          </div>

                          <span>{isChosen ? "Selecionada" : ""}</span>
                        </button>
                      );
                    })}
                  </div>

                  <small style={{ color: "#64748b" }}>
                    Depois de confirmar, não é possível trocar a resposta.
                  </small>

                  {error && <p className="login-error">{error}</p>}

                  <button type="submit" className="activity-submit-button">
                    Confirmar resposta
                  </button>
                </form>
              );
            })()}
          </div>
        </section>
      )}
    </main>
  );
}

export default Questoes;
