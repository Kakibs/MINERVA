import { useState } from "react";
import "./Simulados.css";

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

function Simulados() {
  const user = readObject("minervaLoggedUser");
  const studentSubjects = user?.subjects || [];

  const [simulados] = useState(() =>
    readList("minervaSimulados")
  );

  const [questoes] = useState(() =>
    readList("minervaQuestoes")
  );

  const [respostas, setRespostas] = useState(() =>
    readList("minervaRespostasSimulados")
  );

  const [selectedSimulado, setSelectedSimulado] =
    useState(null);

  const [currentQuestionIndex, setCurrentQuestionIndex] =
    useState(0);

  const [answers, setAnswers] = useState({});

  const [finishedResult, setFinishedResult] =
    useState(null);

  const [error, setError] = useState("");

  const studentSimulados = simulados.filter((simulado) =>
    studentSubjects.includes(simulado.subject)
  );

  function getQuestions(simulado) {
    if (!simulado?.questionIds) {
      return [];
    }

    return simulado.questionIds
      .map((questionId) =>
        questoes.find(
          (questao) => questao.id === questionId
        )
      )
      .filter(Boolean);
  }

  function getStudentResult(simuladoId) {
    return respostas.find(
      (item) =>
        item.simuladoId === simuladoId &&
        item.studentId === user?.id
    );
  }

  function getOptionText(question, optionId) {
    const option = question?.options?.find(
      (item) => item.id === optionId
    );

    return option?.text || "Não encontrada";
  }

  function startSimulado(simulado) {
    if (!user?.id) {
      setError(
        "Não foi possível identificar o aluno logado."
      );
      return;
    }

    const questions = getQuestions(simulado);

    if (questions.length === 0) {
      setError(
        "Este simulado não possui questões disponíveis."
      );
      return;
    }

    setSelectedSimulado(simulado);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setFinishedResult(null);
    setError("");
  }

  function closeSimulado() {
    setSelectedSimulado(null);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setFinishedResult(null);
    setError("");
  }

  // NOVO: sair no meio do simulado (antes não havia como)
  function exitSimulado() {
    if (Object.keys(answers).length > 0) {
      const confirmed = window.confirm(
        "Se você sair agora, as respostas deste simulado serão perdidas. Deseja sair?"
      );

      if (!confirmed) {
        return;
      }
    }

    closeSimulado();
  }

  function handleSelectOption(optionId) {
    const question =
      getQuestions(selectedSimulado)[
        currentQuestionIndex
      ];

    if (!question) {
      return;
    }

    setAnswers((current) => ({
      ...current,
      [question.id]: optionId,
    }));

    setError("");
  }

  function handleNext() {
    const questions =
      getQuestions(selectedSimulado);

    const question =
      questions[currentQuestionIndex];

    if (!question) {
      return;
    }

    if (!answers[question.id]) {
      setError("Selecione uma alternativa.");
      return;
    }

    setError("");

    if (
      currentQuestionIndex <
      questions.length - 1
    ) {
      setCurrentQuestionIndex(
        (current) => current + 1
      );

      return;
    }

    finishSimulado(questions);
  }

  function finishSimulado(questions) {
    const finalAnswers = questions.map(
      (question) => {
        const selectedOption =
          answers[question.id];

        return {
          questionId: question.id,
          selectedOption,
          isCorrect:
            selectedOption ===
            question.correctOptionId,
        };
      }
    );

    const correctAnswers =
      finalAnswers.filter(
        (answer) => answer.isCorrect
      ).length;

    const result = {
      // CORRIGIDO: antes era sempre "resultado-simulado".
      // Agora o ID é único por simulado e por aluno.
      id:
        "resultado-" +
        selectedSimulado.id +
        "-" +
        user.id,
      simuladoId: selectedSimulado.id,
      simuladoTitle: selectedSimulado.title,
      subject: selectedSimulado.subject,
      studentId: user.id,
      studentName: user?.name || "Aluno",
      studentEmail: user?.email || "",
      answers: finalAnswers,
      totalQuestions: questions.length,
      correctAnswers,
      finishedAt: new Date().toISOString(),
    };

    const otherResults = respostas.filter(
      (item) =>
        !(
          item.simuladoId ===
            selectedSimulado.id &&
          item.studentId === user?.id
        )
    );

    const updatedResults = [
      ...otherResults,
      result,
    ];

    if (
      !persist(
        "minervaRespostasSimulados",
        updatedResults
      )
    ) {
      setError(
        "Não foi possível salvar o resultado."
      );
      return;
    }

    setRespostas(updatedResults);
    setFinishedResult(result);
  }

  function viewResult(simulado) {
    const result = getStudentResult(
      simulado.id
    );

    if (!result) {
      return;
    }

    setSelectedSimulado(simulado);
    setFinishedResult(result);
    setError("");
  }

  if (finishedResult && selectedSimulado) {
    // ALTERADO: o percentual usa vírgula, como no resto do Minerva
    const percentage =
      finishedResult.totalQuestions > 0
        ? (
            (finishedResult.correctAnswers /
              finishedResult.totalQuestions) *
            100
          ).toLocaleString("pt-BR", {
            maximumFractionDigits: 1,
          })
        : null;

    return (
      <main className="simulados">
        <div className="simulados-header">
          <span className="simulado-tag completed">
            Resultado disponível
          </span>

          <h1>{finishedResult.simuladoTitle}</h1>

          <p>
            Confira seu desempenho questão por questão.
          </p>
        </div>

        <section className="simulado-result-summary">
          <div className="simulado-result-card">
            <span>ACERTOS</span>
            <strong>
              {finishedResult.correctAnswers}
            </strong>
          </div>

          <div className="simulado-result-card">
            <span>QUESTÕES</span>
            <strong>
              {finishedResult.totalQuestions}
            </strong>
          </div>

          <div className="simulado-result-card">
            <span>APROVEITAMENTO</span>
            <strong>
              {percentage !== null
                ? `${percentage}%`
                : "Sem dados"}
            </strong>
          </div>
        </section>

        <section className="simulado-result-list">
          <div className="section-header">
            <h2>
              Correção das questões
            </h2>
          </div>

          {/* ALTERADO: a lista parte das respostas GRAVADAS no resultado.
              Antes partia das questões atuais, e se o professor apagasse
              uma questão, o resultado mostrava menos questões do que o total. */}
          {finishedResult.answers.map(
            (studentAnswer, index) => {
              const question = questoes.find(
                (item) =>
                  item.id ===
                  studentAnswer.questionId
              );

              if (!question) {
                return (
                  <article
                    key={studentAnswer.questionId}
                    className="simulado-result-question"
                  >
                    <div className="simulado-result-question-header">
                      <span>
                        Questão {index + 1}
                      </span>

                      <strong>
                        Indisponível
                      </strong>
                    </div>

                    <h3>
                      Esta questão foi removida pelo
                      professor.
                    </h3>

                    <div className="simulado-answer-info">
                      <p>
                        {studentAnswer.isCorrect
                          ? "Você havia acertado esta questão."
                          : "Você havia errado esta questão."}
                      </p>
                    </div>
                  </article>
                );
              }

              const selectedOption =
                studentAnswer.selectedOption;

              const isCorrect =
                studentAnswer.isCorrect;

              return (
                <article
                  key={question.id}
                  className={
                    "simulado-result-question " +
                    (isCorrect
                      ? "correct"
                      : "incorrect")
                  }
                >
                  <div className="simulado-result-question-header">
                    <span>
                      Questão {index + 1}
                    </span>

                    <strong>
                      {isCorrect
                        ? "Acertou"
                        : "Errou"}
                    </strong>
                  </div>

                  <h3>
                    {question.statement}
                  </h3>

                  <div className="simulado-answer-info">
                    <p>
                      <strong>
                        Sua resposta:
                      </strong>{" "}
                      {getOptionText(
                        question,
                        selectedOption
                      )}
                    </p>

                    {!isCorrect && (
                      <p>
                        <strong>
                          Resposta correta:
                        </strong>{" "}
                        {getOptionText(
                          question,
                          question.correctOptionId
                        )}
                      </p>
                    )}
                  </div>

                  {question.explanation && (
                    <div className="simulado-explanation">
                      <strong>
                        Explicação
                      </strong>

                      <p>
                        {question.explanation}
                      </p>
                    </div>
                  )}
                </article>
              );
            }
          )}
        </section>

        <button
          type="button"
          className="simulado-button"
          onClick={closeSimulado}
        >
          Voltar para simulados
        </button>
      </main>
    );
  }

  if (selectedSimulado) {
    const questions =
      getQuestions(selectedSimulado);

    const question =
      questions[currentQuestionIndex];

    return (
      <main className="simulados">
        <div className="simulados-header">
          <span className="simulado-tag">
            {selectedSimulado.subject}
          </span>

          <h1>
            {selectedSimulado.title}
          </h1>

          <p>
            Questão {currentQuestionIndex + 1} de{" "}
            {questions.length}
          </p>

          <div
            className="simulado-progress"
            role="progressbar"
            aria-label="Progresso do simulado"
            aria-valuemin={1}
            aria-valuemax={questions.length}
            aria-valuenow={currentQuestionIndex + 1}
          >
            <div
              className="simulado-progress-fill"
              style={{
                width:
                  questions.length > 0
                    ? ((currentQuestionIndex + 1) /
                        questions.length) *
                        100 +
                      "%"
                    : "0%",
              }}
            />
          </div>
        </div>

        {question && (
          <div className="simulado-question">
            <span className="simulado-question-topic">
              {question.topic}
            </span>

            <h2>
              {question.statement}
            </h2>

            <div className="simulado-options">
              {question.options.map(
                (option) => (
                  <label
                    key={option.id}
                    className={
                      "simulado-option" +
                      (answers[question.id] ===
                      option.id
                        ? " selected"
                        : "")
                    }
                  >
                    <input
                      type="radio"
                      name={
                        "question-" +
                        question.id
                      }
                      value={option.id}
                      checked={
                        answers[question.id] ===
                        option.id
                      }
                      onChange={() =>
                        handleSelectOption(
                          option.id
                        )
                      }
                    />

                    <span>
                      {option.text}
                    </span>
                  </label>
                )
              )}
            </div>

            {error && (
              <p
                className="login-error"
                role="alert"
              >
                {error}
              </p>
            )}

            {/* NOVO: botão de sair ao lado do botão de avançar */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
                marginTop: 24,
              }}
            >
              <button
                type="button"
                className="simulado-button"
                onClick={handleNext}
              >
                {currentQuestionIndex ===
                questions.length - 1
                  ? "Finalizar simulado"
                  : "Próxima questão"}
              </button>

              <button
                type="button"
                className="simulado-button result"
                onClick={exitSimulado}
              >
                Sair do simulado
              </button>
            </div>
          </div>
        )}
      </main>
    );
  }

  return (
    <main className="simulados">
      <div className="simulados-header">
        <h1>Simulados</h1>

        <p>
          Teste seus conhecimentos e acompanhe sua
          evolução.
        </p>
      </div>

      {studentSimulados.length === 0 ? (
        <div className="simulado-card">
          <div className="simulado-info">
            <h2>
              Nenhum simulado disponível
            </h2>

            <p>
              Ainda não existem simulados disponíveis
              para as disciplinas que você está
              cursando.
            </p>
          </div>
        </div>
      ) : (
        <div className="simulados-list">
          {studentSimulados.map((simulado) => {
            const questions =
              getQuestions(simulado);

            const result =
              getStudentResult(simulado.id);

            return (
              <div
                className="simulado-card"
                key={simulado.id}
              >
                <div className="simulado-info">
                  <span
                    className={
                      result
                        ? "simulado-tag completed"
                        : "simulado-tag"
                    }
                  >
                    {result
                      ? "Concluído"
                      : "Disponível"}
                  </span>

                  <h2>
                    {simulado.title}
                  </h2>

                  {simulado.description && (
                    <p>
                      {simulado.description}
                    </p>
                  )}

                  <p>
                    {questions.length}{" "}
                    {questions.length === 1
                      ? "questão"
                      : "questões"}
                  </p>
                </div>

                {result ? (
                  <button
                    type="button"
                    className="simulado-button result"
                    onClick={() =>
                      viewResult(simulado)
                    }
                  >
                    Ver resultado
                  </button>
                ) : (
                  <button
                    type="button"
                    className="simulado-button"
                    onClick={() =>
                      startSimulado(simulado)
                    }
                  >
                    Iniciar
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {error && (
        <p
          className="login-error"
          role="alert"
        >
          {error}
        </p>
      )}
    </main>
  );
}

export default Simulados;