import { useState } from "react";
import "./ProfessorSimulados.css";

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

function ProfessorSimulados() {
  const loggedUser = readObject("minervaLoggedUser");

  const professorSubjects = loggedUser?.subjects || [];

  const [simulados, setSimulados] = useState(() =>
    readList("minervaSimulados")
  );

  const [questoes, setQuestoes] = useState(() =>
    readList("minervaQuestoes")
  );

  const [respostas, setRespostas] = useState(() =>
    readList("minervaRespostasSimulados")
  );

  const [users] = useState(() =>
    readList("minervaUsers")
  );

  const [showForm, setShowForm] = useState(false);

  const [selectedSimulado, setSelectedSimulado] =
    useState(null);

  const [showNewQuestion, setShowNewQuestion] =
    useState(false);

  const [form, setForm] = useState({
    subject: professorSubjects[0] || "",
    title: "",
    description: "",
    questionIds: [],
  });

  const [newQuestion, setNewQuestion] = useState({
    topic: "",
    statement: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctOptionId: "a",
    explanation: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================
  // SIMULADOS DO PROFESSOR
  // ==========================================

  const professorSimulados = simulados.filter(
    (simulado) =>
      simulado.professorId === loggedUser?.id ||
      (
        !simulado.professorId &&
        professorSubjects.includes(simulado.subject)
      )
  );

  // ==========================================
  // QUESTÕES DO PROFESSOR
  // ==========================================

  const professorQuestoes = questoes.filter(
    (questao) =>
      questao.professorId === loggedUser?.id ||
      (
        professorSubjects.includes(questao.subject) &&
        (
          !questao.professorId ||
          questao.professorId === loggedUser?.id
        )
      )
  );

  // ==========================================
  // ALUNOS ATIVOS DO PROFESSOR
  // ==========================================

  const alunos = users.filter(
    (user) =>
      user.userType === "aluno" &&
      user.status === "ativo" &&
      (user.subjects || []).some((subject) =>
        professorSubjects.includes(subject)
      )
  );

  // ==========================================
  // REALIZAÇÕES DOS SIMULADOS
  // ==========================================

  const totalRealizados = respostas.filter((resposta) =>
    professorSimulados.some(
      (simulado) =>
        simulado.id === resposta.simuladoId
    )
  );

  // ==========================================
  // DESEMPENHO MÉDIO
  // ==========================================

  let averageAccuracy = null;

  if (totalRealizados.length > 0) {
    let totalQuestions = 0;
    let totalCorrect = 0;

    totalRealizados.forEach((resultado) => {
      totalQuestions +=
        Number(resultado.totalQuestions) || 0;

      totalCorrect +=
        Number(resultado.correctAnswers) || 0;
    });

    if (totalQuestions > 0) {
      averageAccuracy = Math.round(
        (totalCorrect / totalQuestions) * 100
      );
    }
  }

  // ==========================================
  // FORMULÁRIO DO SIMULADO
  // ==========================================

  function resetForm() {
    setForm({
      subject: professorSubjects[0] || "",
      title: "",
      description: "",
      questionIds: [],
    });

    setNewQuestion({
      topic: "",
      statement: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctOptionId: "a",
      explanation: "",
    });

    setShowNewQuestion(false);

    setError("");
    setSuccess("");
  }

  function openCreateForm() {
    resetForm();
    setShowForm(true);
    setSelectedSimulado(null);
  }

  function closeCreateForm() {
    setShowForm(false);
    resetForm();
  }

  function handleFormChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  }

  // ==========================================
  // SELECIONAR QUESTÃO EXISTENTE
  // ==========================================

  function toggleQuestion(questionId) {
    setForm((current) => {
      const alreadySelected =
        current.questionIds.includes(questionId);

      return {
        ...current,
        questionIds: alreadySelected
          ? current.questionIds.filter(
              (id) => id !== questionId
            )
          : [...current.questionIds, questionId],
      };
    });

    setError("");
  }

  // ==========================================
  // FORMULÁRIO DA NOVA QUESTÃO
  // ==========================================

  function handleNewQuestionChange(event) {
    const { name, value } = event.target;

    setNewQuestion((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
  }

  // ==========================================
  // CRIAR QUESTÃO DENTRO DO SIMULADO
  // ==========================================

  function handleCreateQuestion() {
    setError("");
    setSuccess("");

    if (!loggedUser?.id) {
      setError(
        "Não foi possível identificar o professor logado."
      );
      return;
    }

    if (!form.subject) {
      setError(
        "Selecione uma disciplina antes de criar a questão."
      );
      return;
    }

    if (!newQuestion.topic.trim()) {
      setError("Digite o tema da questão.");
      return;
    }

    if (!newQuestion.statement.trim()) {
      setError("Digite o enunciado da questão.");
      return;
    }

    if (!newQuestion.optionA.trim()) {
      setError("Preencha a alternativa A.");
      return;
    }

    if (!newQuestion.optionB.trim()) {
      setError("Preencha a alternativa B.");
      return;
    }

    if (!newQuestion.optionC.trim()) {
      setError("Preencha a alternativa C.");
      return;
    }

    if (!newQuestion.optionD.trim()) {
      setError("Preencha a alternativa D.");
      return;
    }

    const newQuestionObject = {
  id: crypto.randomUUID(),
  subject: form.subject,
  topic: newQuestion.topic.trim(),
  statement: newQuestion.statement.trim(),

      options: [
        {
          id: "a",
          text: newQuestion.optionA.trim(),
        },
        {
          id: "b",
          text: newQuestion.optionB.trim(),
        },
        {
          id: "c",
          text: newQuestion.optionC.trim(),
        },
        {
          id: "d",
          text: newQuestion.optionD.trim(),
        },
      ],

      correctOptionId:
        newQuestion.correctOptionId,

      explanation:
        newQuestion.explanation.trim(),

      professorId: loggedUser.id,
      professorName:
        loggedUser.name || "Professor",

      createdAt: new Date().toISOString(),
    };

    const updatedQuestions = [
      ...questoes,
      newQuestionObject,
    ];

    if (
      !persist(
        "minervaQuestoes",
        updatedQuestions
      )
    ) {
      setError(
        "Não foi possível salvar a questão."
      );
      return;
    }

    setQuestoes(updatedQuestions);

    setForm((current) => ({
      ...current,
      questionIds: [
        ...current.questionIds,
        newQuestionObject.id,
      ],
    }));

    setNewQuestion({
      topic: "",
      statement: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctOptionId: "a",
      explanation: "",
    });

    setShowNewQuestion(false);

    setSuccess(
      "Questão criada e adicionada ao simulado."
    );
  }

  // ==========================================
  // CRIAR SIMULADO
  // ==========================================

  function handleCreate(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!loggedUser?.id) {
      setError(
        "Não foi possível identificar o professor logado."
      );
      return;
    }

    if (!form.subject) {
      setError("Selecione uma disciplina.");
      return;
    }

    if (!form.title.trim()) {
      setError("Digite o título do simulado.");
      return;
    }

    if (form.questionIds.length === 0) {
      setError(
        "Adicione pelo menos uma questão ao simulado."
      );
      return;
    }

    const newSimulado = {
      id: crypto.randomUUID(),
      subject: form.subject,
      title: form.title.trim(),
      description: form.description.trim(),
      questionIds: form.questionIds,
      professorId: loggedUser.id,
      professorName:
        loggedUser.name || "Professor",
      createdAt: new Date().toISOString(),
    };

    const updated = [
      ...simulados,
      newSimulado,
    ];

    if (
      !persist(
        "minervaSimulados",
        updated
      )
    ) {
      setError(
        "Não foi possível salvar o simulado."
      );
      return;
    }

    setSimulados(updated);

    setSuccess(
      "Simulado criado com sucesso."
    );

    setForm({
      subject: professorSubjects[0] || "",
      title: "",
      description: "",
      questionIds: [],
    });

    setNewQuestion({
      topic: "",
      statement: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctOptionId: "a",
      explanation: "",
    });

    setShowNewQuestion(false);
    setShowForm(false);
  }

  // ==========================================
  // EXCLUIR SIMULADO
  // ==========================================

  function handleDelete(simulado) {
    const confirmed = window.confirm(
      `Deseja excluir o simulado "${simulado.title}"?`
    );

    if (!confirmed) {
      return;
    }

    const updated = simulados.filter(
      (item) => item.id !== simulado.id
    );

    if (
      !persist(
        "minervaSimulados",
        updated
      )
    ) {
      setError(
        "Não foi possível excluir o simulado."
      );
      return;
    }

    const updatedResponses =
      respostas.filter(
        (resposta) =>
          resposta.simuladoId !==
          simulado.id
      );

    persist(
      "minervaRespostasSimulados",
      updatedResponses
    );

    setSimulados(updated);
    setRespostas(updatedResponses);

    if (
      selectedSimulado?.id ===
      simulado.id
    ) {
      setSelectedSimulado(null);
    }

    setSuccess(
      "Simulado excluído com sucesso."
    );
  }

  // ==========================================
  // ABRIR SIMULADO
  // ==========================================

  function openSimulado(simulado) {
    setSelectedSimulado(simulado);
    setShowForm(false);
    setError("");
    setSuccess("");
  }

  // ==========================================
  // RESPOSTAS DE UM SIMULADO
  // ==========================================

  function getSimuladoResponses(simuladoId) {
    return respostas.filter(
      (resposta) =>
        resposta.simuladoId ===
        simuladoId
    );
  }

  // ==========================================
  // QUESTÕES DE UM SIMULADO
  // ==========================================

  function getSimuladoQuestions(simulado) {
    return (simulado.questionIds || [])
      .map((questionId) =>
        questoes.find(
          (questao) =>
            questao.id === questionId
        )
      )
      .filter(Boolean);
  }

  // ==========================================
  // ALUNOS DA DISCIPLINA
  // ==========================================

  function getStudentsForSimulado(simulado) {
    return alunos.filter((aluno) =>
      (aluno.subjects || []).includes(
        simulado.subject
      )
    );
  }

  // ==========================================
  // RESULTADO DO ALUNO
  // ==========================================

  function getStudentResult(
    simuladoId,
    studentId
  ) {
    return respostas.find(
      (resposta) =>
        resposta.simuladoId ===
          simuladoId &&
        resposta.studentId ===
          studentId
    );
  }

  // ==========================================
  // DATA
  // ==========================================

  function formatDate(date) {
    if (!date) {
      return "Data não registrada";
    }

    const parsedDate = new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "Data não registrada";
    }

    return parsedDate.toLocaleDateString(
      "pt-BR"
    );
  }

  return (
    <main className="professor-content professor-simulations-page">

      {/* ======================================
          CABEÇALHO
      ====================================== */}

      <section className="professor-welcome">

        <p className="professor-label">
          SIMULADOS
        </p>

        <h1>
          Simulados
        </h1>

        <p className="professor-description">
          Crie simulados com questões da sua
          disciplina e acompanhe os resultados
          reais dos alunos.
        </p>

      </section>

      {/* ======================================
          CARDS PRINCIPAIS
      ====================================== */}

      <section className="professor-grid">

        <div className="professor-card">

          <span>
            SIMULADOS CRIADOS
          </span>

          <h2>
            {professorSimulados.length > 0
              ? professorSimulados.length
              : "Sem dados"}
          </h2>

          <p>
            Simulados cadastrados por você.
          </p>

        </div>

        <div className="professor-card">

          <span>
            REALIZADOS
          </span>

          <h2>
            {totalRealizados.length > 0
              ? totalRealizados.length
              : "Sem dados"}
          </h2>

          <p>
            Realizações registradas no sistema.
          </p>

        </div>

        <div className="professor-card">

          <span>
            DESEMPENHO MÉDIO
          </span>

          <h2>
            {averageAccuracy === null
              ? "Sem dados"
              : `${averageAccuracy}%`}
          </h2>

          <p>
            {averageAccuracy === null
              ? "A média aparecerá quando houver resultados reais."
              : "Aproveitamento médio nas questões dos simulados."}
          </p>

        </div>

      </section>

      {/* ======================================
          LISTA DE SIMULADOS
      ====================================== */}

      <section className="professor-section">

        <div className="section-header">

          <div>

            <h2>
              Meus simulados
            </h2>

            <p>
              Crie um simulado usando questões
              cadastradas ou crie novas questões
              diretamente nele.
            </p>

          </div>

          <button
            type="button"
            onClick={openCreateForm}
          >
            + Criar simulado
          </button>

        </div>

        {success && (
          <p className="login-success">
            {success}
          </p>
        )}

        {error && (
          <p className="login-error">
            {error}
          </p>
        )}

        {professorSimulados.length === 0 ? (

          <div className="professor-empty-state">

            <h3>
              Nenhum simulado criado
            </h3>

            <p>
              Crie seu primeiro simulado usando
              questões cadastradas ou novas questões.
            </p>

          </div>

        ) : (

          <ul className="professor-list">

            {professorSimulados.map(
              (simulado) => {

                const simuladoQuestions =
                  getSimuladoQuestions(
                    simulado
                  );

                const simuladoResponses =
                  getSimuladoResponses(
                    simulado.id
                  );

                return (
                  <li
                    key={simulado.id}
                  >

                    <div>

                      <span>
                        {simulado.subject}
                      </span>

                      <p>
                        {simulado.title}
                      </p>

                      {simulado.description && (
                        <small>
                          {simulado.description}
                        </small>
                      )}

                    </div>

                    <span>
                      {simuladoQuestions.length}{" "}
                      {simuladoQuestions.length === 1
                        ? "questão"
                        : "questões"}
                    </span>

                    <span>
                      {simuladoResponses.length > 0
                        ? simuladoResponses.length +
                          (
                            simuladoResponses.length === 1
                              ? " realização"
                              : " realizações"
                          )
                        : "Sem realizações"}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        openSimulado(
                          simulado
                        )
                      }
                    >
                      Ver simulado
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(
                          simulado
                        )
                      }
                    >
                      Excluir
                    </button>

                  </li>
                );
              }
            )}

          </ul>
        )}

      </section>

      {/* ======================================
          FORMULÁRIO DE CRIAÇÃO
      ====================================== */}

      {showForm && (

        <section className="professor-section">

          <div className="section-header">

            <div>

              <h2>
                Criar simulado
              </h2>

              <p>
                Escolha questões existentes ou
                crie novas questões diretamente
                neste simulado.
              </p>

            </div>

            <button
              type="button"
              onClick={closeCreateForm}
            >
              Fechar
            </button>

          </div>

          <form
            className="professor-form"
            onSubmit={handleCreate}
          >

            {/* ================================
                DADOS DO SIMULADO
            ================================= */}

            <label>
              Disciplina

              <select
                name="subject"
                value={form.subject}
                onChange={handleFormChange}
              >

                <option value="">
                  Selecione
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
              Título

              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleFormChange}
                placeholder="Ex.: Simulado — Funções"
              />

            </label>

            <label>
              Descrição

              <textarea
                name="description"
                rows="4"
                value={form.description}
                onChange={handleFormChange}
                placeholder="Explique o conteúdo ou objetivo do simulado."
              />

            </label>

            {/* ================================
                QUESTÕES
            ================================= */}

            <div className="professor-section">

              <div className="section-header">

                <div>

                  <h3>
                    Questões do simulado
                  </h3>

                  <p>
                    Escolha questões existentes
                    ou crie uma nova questão aqui.
                  </p>

                </div>

                <strong>
                  {form.questionIds.length}{" "}
                  {form.questionIds.length === 1
                    ? "selecionada"
                    : "selecionadas"}
                </strong>

              </div>

              {/* =================================
                  BOTÃO NOVA QUESTÃO
              ================================= */}

              <button
                type="button"
                onClick={() => {
                  setShowNewQuestion(
                    (current) => !current
                  );

                  setError("");
                }}
              >
                {showNewQuestion
                  ? "Fechar criação de questão"
                  : "+ Criar nova questão"}
              </button>

              {/* =================================
                  FORMULÁRIO DA NOVA QUESTÃO
              ================================= */}

              {showNewQuestion && (

                <div className="professor-section">

                  <div className="section-header">

                    <div>

                      <h3>
                        Nova questão
                      </h3>

                      <p>
                        Essa questão será salva no
                        banco local do Minerva e
                        adicionada automaticamente
                        ao simulado.
                      </p>

                    </div>

                  </div>

                  <label>
                    Tema

                    <input
                      type="text"
                      name="topic"
                      value={
                        newQuestion.topic
                      }
                      onChange={
                        handleNewQuestionChange
                      }
                      placeholder="Ex.: Função do 2º grau"
                    />

                  </label>

                  <label>
                    Enunciado

                    <textarea
                      name="statement"
                      rows="5"
                      value={
                        newQuestion.statement
                      }
                      onChange={
                        handleNewQuestionChange
                      }
                      placeholder="Digite o enunciado completo da questão."
                    />

                  </label>

                  <label>
                    Alternativa A

                    <input
                      type="text"
                      name="optionA"
                      value={
                        newQuestion.optionA
                      }
                      onChange={
                        handleNewQuestionChange
                      }
                      placeholder="Digite a alternativa A"
                    />

                  </label>

                  <label>
                    Alternativa B

                    <input
                      type="text"
                      name="optionB"
                      value={
                        newQuestion.optionB
                      }
                      onChange={
                        handleNewQuestionChange
                      }
                      placeholder="Digite a alternativa B"
                    />

                  </label>

                  <label>
                    Alternativa C

                    <input
                      type="text"
                      name="optionC"
                      value={
                        newQuestion.optionC
                      }
                      onChange={
                        handleNewQuestionChange
                      }
                      placeholder="Digite a alternativa C"
                    />

                  </label>

                  <label>
                    Alternativa D

                    <input
                      type="text"
                      name="optionD"
                      value={
                        newQuestion.optionD
                      }
                      onChange={
                        handleNewQuestionChange
                      }
                      placeholder="Digite a alternativa D"
                    />

                  </label>

                  <label>
                    Resposta correta

                    <select
                      name="correctOptionId"
                      value={
                        newQuestion.correctOptionId
                      }
                      onChange={
                        handleNewQuestionChange
                      }
                    >

                      <option value="a">
                        Alternativa A
                      </option>

                      <option value="b">
                        Alternativa B
                      </option>

                      <option value="c">
                        Alternativa C
                      </option>

                      <option value="d">
                        Alternativa D
                      </option>

                    </select>

                  </label>

                  <label>
                    Explicação da resposta

                    <textarea
                      name="explanation"
                      rows="4"
                      value={
                        newQuestion.explanation
                      }
                      onChange={
                        handleNewQuestionChange
                      }
                      placeholder="Explique por que essa é a resposta correta. Opcional."
                    />

                  </label>

                  <button
                    type="button"
                    onClick={
                      handleCreateQuestion
                    }
                    className="activity-submit-button"
                  >
                    + Adicionar questão ao simulado
                  </button>

                </div>

              )}

              {/* =================================
                  QUESTÕES EXISTENTES
              ================================= */}

              <div className="professor-section">

                <div className="section-header">

                  <div>

                    <h3>
                      Questões já cadastradas
                    </h3>

                    <p>
                      Você também pode aproveitar
                      questões que já existem no Minerva.
                    </p>

                  </div>

                </div>

                {professorQuestoes.filter(
                  (questao) =>
                    !form.subject ||
                    questao.subject ===
                      form.subject
                ).length === 0 ? (

                  <div className="professor-empty-state">

                    <h3>
                      Nenhuma questão disponível
                    </h3>

                    <p>
                      Você ainda não possui questões
                      cadastradas nessa disciplina.
                      Use "Criar nova questão" acima
                      para adicionar uma.
                    </p>

                  </div>

                ) : (

                  <div className="professor-question-selection">

                    {professorQuestoes
                      .filter(
                        (questao) =>
                          !form.subject ||
                          questao.subject ===
                            form.subject
                      )
                      .map(
                        (questao) => {

                          const selected =
                            form.questionIds.includes(
                              questao.id
                            );

                          return (

                            <label
                              key={questao.id}
                              className={
                                "professor-question-option" +
                                (
                                  selected
                                    ? " selected"
                                    : ""
                                )
                              }
                            >

                              <input
                                type="checkbox"
                                checked={
                                  selected
                                }
                                onChange={() =>
                                  toggleQuestion(
                                    questao.id
                                  )
                                }
                              />

                              <div>

                                <span>
                                  {questao.topic}
                                </span>

                                <p>
                                  {
                                    questao.statement
                                  }
                                </p>

                              </div>

                            </label>

                          );
                        }
                      )}

                  </div>
                )}

              </div>

            </div>

            {error && (
              <p className="login-error">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="activity-submit-button"
            >
              Criar simulado
            </button>

          </form>

        </section>
      )}

      {/* ======================================
          DETALHES DO SIMULADO
      ====================================== */}

      {selectedSimulado && (

        <section className="professor-section">

          <div className="section-header">

            <div>

              <span>
                {selectedSimulado.subject}
              </span>

              <h2>
                {selectedSimulado.title}
              </h2>

              {selectedSimulado.description && (
                <p>
                  {selectedSimulado.description}
                </p>
              )}

            </div>

            <button
              type="button"
              onClick={() =>
                setSelectedSimulado(null)
              }
            >
              Fechar
            </button>

          </div>

          {/* ==================================
              RESUMO DO SIMULADO
          ================================== */}

          {(() => {

            const questions =
              getSimuladoQuestions(
                selectedSimulado
              );

            const responses =
              getSimuladoResponses(
                selectedSimulado.id
              );

            const students =
              getStudentsForSimulado(
                selectedSimulado
              );

            let totalQuestions = 0;
            let totalCorrect = 0;

            responses.forEach(
              (result) => {

                totalQuestions +=
                  Number(
                    result.totalQuestions
                  ) || 0;

                totalCorrect +=
                  Number(
                    result.correctAnswers
                  ) || 0;

              }
            );

            const accuracy =
              totalQuestions > 0
                ? Math.round(
                    (
                      totalCorrect /
                      totalQuestions
                    ) * 100
                  )
                : null;

            return (
              <>

                <section className="professor-grid">

                  <div className="professor-card">

                    <span>
                      QUESTÕES
                    </span>

                    <h2>
                      {questions.length}
                    </h2>

                    <p>
                      Questões incluídas no simulado.
                    </p>

                  </div>

                  <div className="professor-card">

                    <span>
                      REALIZADOS
                    </span>

                    <h2>
                      {responses.length > 0
                        ? responses.length
                        : "Sem dados"}
                    </h2>

                    <p>
                      Resultados registrados.
                    </p>

                  </div>

                  <div className="professor-card">

                    <span>
                      APROVEITAMENTO
                    </span>

                    <h2>
                      {accuracy === null
                        ? "Sem dados"
                        : `${accuracy}%`}
                    </h2>

                    <p>
                      {accuracy === null
                        ? "Ainda não há resultados."
                        : "Aproveitamento real nas questões."}
                    </p>

                  </div>

                </section>

                {/* ============================
                    RESULTADOS DOS ALUNOS
                ============================ */}

                <section className="professor-section">

                  <div className="section-header">

                    <div>

                      <h2>
                        Resultados dos alunos
                      </h2>

                      <p>
                        Acompanhe quem realizou o
                        simulado e o desempenho individual.
                      </p>

                    </div>

                  </div>

                  {students.length === 0 ? (

                    <div className="professor-empty-state">

                      <h3>
                        Sem alunos disponíveis
                      </h3>

                      <p>
                        Ainda não existem alunos ativos
                        nessa disciplina.
                      </p>

                    </div>

                  ) : (

                    <ul className="professor-list">

                      {students.map(
                        (student) => {

                          const result =
                            getStudentResult(
                              selectedSimulado.id,
                              student.id
                            );

                          if (!result) {

                            return (
                              <li
                                key={student.id}
                              >

                                <div>

                                  <span>
                                    {student.email}
                                  </span>

                                  <p>
                                    {student.name}
                                  </p>

                                </div>

                                <span>
                                  Não realizado
                                </span>

                              </li>
                            );
                          }

                          const total =
                            Number(
                              result.totalQuestions
                            ) || 0;

                          const correct =
                            Number(
                              result.correctAnswers
                            ) || 0;

                          const percentage =
                            total > 0
                              ? Math.round(
                                  (
                                    correct /
                                    total
                                  ) * 100
                                )
                              : null;

                          return (
                            <li
                              key={student.id}
                            >

                              <div>

                                <span>
                                  {student.email}
                                </span>

                                <p>
                                  {student.name}
                                </p>

                                <small>
                                  Realizado em{" "}
                                  {formatDate(
                                    result.finishedAt
                                  )}
                                </small>

                              </div>

                              <span>
                                {correct} de {total}{" "}
                                {total === 1
                                  ? "questão"
                                  : "questões"}
                              </span>

                              <span>
                                {percentage === null
                                  ? "Sem dados"
                                  : `${percentage}%`}
                              </span>

                            </li>
                          );
                        }
                      )}

                    </ul>
                  )}

                </section>

                {/* ============================
                    QUESTÕES DO SIMULADO
                ============================ */}

                <section className="professor-section">

                  <div className="section-header">

                    <div>

                      <h2>
                        Questões do simulado
                      </h2>

                      <p>
                        Confira as questões utilizadas
                        nesta avaliação.
                      </p>

                    </div>

                  </div>

                  <div className="professor-list">

                    {questions.map(
                      (questao, index) => (

                        <div
                          className="professor-card"
                          key={questao.id}
                        >

                          <span>
                            QUESTÃO {index + 1}
                          </span>

                          <p>
                            {questao.statement}
                          </p>

                          <small>
                            {questao.topic}
                          </small>

                        </div>

                      )
                    )}

                  </div>

                </section>

              </>
            );
          })()}

        </section>
      )}

    </main>
  );
}

export default ProfessorSimulados;