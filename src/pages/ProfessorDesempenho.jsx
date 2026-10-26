import "./ProfessorDesempenho.css";

function readList(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function readObject(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch {
    return null;
  }
}

function shorten(value, max = 25) {
  if (!value) return "Sem dados";
  return value.length > max ? `${value.slice(0, max)}…` : value;
}

function belongsToProfessor(item, professor) {
  if (!item || !professor) return false;

  const professorId = professor.id;
  const professorEmail = professor.email?.toLowerCase();

  const possibleIds = [
    item.professorId,
    item.teacherId,
    item.createdById,
    item.userId,
  ];

  const possibleEmails = [
    item.professorEmail,
    item.teacherEmail,
    item.createdByEmail,
  ].map((email) => email?.toLowerCase());

  const possibleCreators = [
    item.createdBy,
    item.professor,
    item.teacher,
  ];

  return (
    possibleIds.some(
      (id) =>
        id != null &&
        professorId != null &&
        String(id) === String(professorId)
    ) ||
    possibleEmails.some(
      (email) =>
        email && professorEmail && email === professorEmail
    ) ||
    possibleCreators.some(
      (creator) =>
        creator &&
        (
          String(creator) === String(professorId) ||
          String(creator).toLowerCase() === professorEmail
        )
    )
  );
}

export default function ProfessorDesempenho() {
  const professor = readObject("minervaLoggedUser");

  const users = readList("minervaUsers");
  const questoes = readList("minervaQuestoes");
  const respostasQuestoes = readList("minervaRespostasQuestoes");
  const atividades = readList("minervaAtividades");
  const simulados = readList("minervaSimulados");
  const respostasSimulados = readList("minervaRespostasSimulados");

  // Alunos cadastrados e aprovados
  const alunosAtivos = users.filter((user) => {
    const role = String(user.role || user.tipo || "").toLowerCase();
    const status = String(user.status || "").toLowerCase();

    return (
      ["aluno", "student"].includes(role) &&
      (
        !status ||
        ["aprovado", "approved", "ativo", "active"].includes(status)
      )
    );
  });

  // Conteúdos vinculados ao professor
  const professorQuestoes = questoes.filter((item) =>
    belongsToProfessor(item, professor)
  );

  const professorAtividades = atividades.filter((item) =>
    belongsToProfessor(item, professor)
  );

  const professorSimulados = simulados.filter((item) =>
    belongsToProfessor(item, professor)
  );

  const questaoIds = new Set(
    professorQuestoes.map((item) => String(item.id))
  );

  const simuladoIds = new Set(
    professorSimulados.map((item) => String(item.id))
  );

  // Respostas às questões do professor
  const professorRespostas = respostasQuestoes.filter((resposta) =>
    questaoIds.has(String(resposta.questionId))
  );

  // Resultados dos simulados do professor
  const professorRespostasSimulados = respostasSimulados.filter(
    (resultado) => simuladoIds.has(String(resultado.simuladoId))
  );

  // Desempenho combinado por assunto
  const groupedTopics = {};

  function registerTopicAnswer({ subject, topic, isCorrect }) {
    const normalizedSubject = subject || "Sem disciplina";
    const normalizedTopic = topic || "Sem assunto";
    const key = JSON.stringify([
      normalizedSubject,
      normalizedTopic,
    ]);

    if (!groupedTopics[key]) {
      groupedTopics[key] = {
        subject: normalizedSubject,
        topic: normalizedTopic,
        total: 0,
        correct: 0,
      };
    }

    groupedTopics[key].total += 1;

    if (isCorrect === true) {
      groupedTopics[key].correct += 1;
    }
  }

  // Respostas das questões avulsas
  professorRespostas.forEach((resposta) => {
    const question = questoes.find(
      (item) => String(item.id) === String(resposta.questionId)
    );

    registerTopicAnswer({
      subject: resposta.subject || question?.subject,
      topic: resposta.topic || question?.topic,
      isCorrect: resposta.isCorrect,
    });
  });

  // Respostas dadas nos simulados
  professorRespostasSimulados.forEach((resultado) => {
    const simulado = professorSimulados.find(
      (item) => String(item.id) === String(resultado.simuladoId)
    );

    if (!simulado || !Array.isArray(resultado.answers)) {
      return;
    }

    resultado.answers.forEach((answer) => {
      const question = questoes.find(
        (item) => String(item.id) === String(answer.questionId)
      );

      if (!question) return;

      registerTopicAnswer({
        subject: question.subject || simulado.subject,
        topic: question.topic,
        isCorrect: answer.isCorrect,
      });
    });
  });

  const topicPerformance = Object.values(groupedTopics)
    .map((item) => ({
      ...item,
      accuracy: Math.round((item.correct / item.total) * 100),
    }))
    .sort((a, b) => a.accuracy - b.accuracy);

  const biggestDifficulty =
    topicPerformance.length > 0 ? topicPerformance[0] : null;

  // Indicadores das questões
  const totalRespostasQuestoes = professorRespostas.length;

  const acertosQuestoes = professorRespostas.filter(
    (resposta) => resposta.isCorrect === true
  ).length;

  const aproveitamentoQuestoes =
    totalRespostasQuestoes > 0
      ? Math.round(
          (acertosQuestoes / totalRespostasQuestoes) * 100
        )
      : null;

  // Indicadores dos simulados
  const totalSimuladosRealizados =
    professorRespostasSimulados.length;

  const totalQuestoesSimulados =
    professorRespostasSimulados.reduce((total, resultado) => {
      const quantidade =
        Number(resultado.totalQuestions) ||
        (Array.isArray(resultado.answers)
          ? resultado.answers.length
          : 0);

      return total + quantidade;
    }, 0);

  const totalAcertosSimulados =
    professorRespostasSimulados.reduce((total, resultado) => {
      return total + (Number(resultado.correctAnswers) || 0);
    }, 0);

  const aproveitamentoSimulados =
    totalQuestoesSimulados > 0
      ? Math.round(
          (totalAcertosSimulados / totalQuestoesSimulados) * 100
        )
      : null;

  // Conteúdos recentes criados pelo professor
  const atividadesRecentes = [
    ...professorAtividades.map((item) => ({
      id: `atividade-${item.id}`,
      title: item.title || item.titulo || "Atividade criada",
      type: "Atividade",
      date: item.createdAt || item.dataCriacao || item.date || "",
    })),

    ...professorQuestoes.map((item) => ({
      id: `questao-${item.id}`,
      title: item.topic || item.assunto || "Questão criada",
      type: "Questão",
      date: item.createdAt || item.dataCriacao || item.date || "",
    })),

    ...professorSimulados.map((item) => ({
      id: `simulado-${item.id}`,
      title: item.title || item.titulo || "Simulado criado",
      type: "Simulado",
      date: item.createdAt || item.dataCriacao || item.date || "",
    })),
  ]
    .sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;

      return dateB - dateA;
    })
    .slice(0, 6);

  function formatDate(date) {
    if (!date) return "Data não informada";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Data não informada";
    }

    return parsedDate.toLocaleDateString("pt-BR");
  }

  return (
    <main className="professor-content professor-performance-page">
      <header className="professor-welcome">
        <p className="professor-label">
          MINERVA • ÁREA DO PROFESSOR
        </p>

        <h1>Desempenho dos alunos</h1>

        <p className="professor-description">
          Acompanhe as respostas dos alunos, identifique os assuntos
          que precisam de revisão e utilize os resultados para
          planejar as próximas aulas presenciais.
        </p>
      </header>

      {/* Indicadores gerais */}
      <section className="professor-grid">
        <div className="professor-card">
          <span>ALUNOS ATIVOS</span>
          <h2>{alunosAtivos.length}</h2>
          <p>Alunos com cadastro aprovado.</p>
        </div>

        <div className="professor-card">
          <span>RESPOSTAS DE QUESTÕES</span>
          <h2>{totalRespostasQuestoes}</h2>
          <p>
            {aproveitamentoQuestoes === null
              ? "Ainda não há respostas registradas."
              : `${aproveitamentoQuestoes}% de acertos nas questões avulsas.`}
          </p>
        </div>

        <div className="professor-card">
          <span>SIMULADOS REALIZADOS</span>
          <h2>{totalSimuladosRealizados}</h2>
          <p>Resultados registrados nos seus simulados.</p>
        </div>

        <div className="professor-card">
          <span>APROVEITAMENTO EM SIMULADOS</span>
          <h2>
            {aproveitamentoSimulados === null
              ? "—"
              : `${aproveitamentoSimulados}%`}
          </h2>
          <p>
            {totalQuestoesSimulados > 0
              ? `${totalAcertosSimulados} acertos em ${totalQuestoesSimulados} questões.`
              : "Ainda não há resultados suficientes."}
          </p>
        </div>

        <div className="professor-card">
          <span>MAIOR DIFICULDADE</span>

          <h2>
            {biggestDifficulty
              ? shorten(biggestDifficulty.topic, 25)
              : "Sem dados"}
          </h2>

          <p>
            {biggestDifficulty
              ? `${biggestDifficulty.accuracy}% de acertos em ${
                  biggestDifficulty.total
                } ${
                  biggestDifficulty.total === 1
                    ? "resposta"
                    : "respostas"
                }, considerando questões e simulados.`
              : "Ainda não há respostas suficientes para identificar uma dificuldade."}
          </p>
        </div>
      </section>

      {/* Assuntos que precisam de atenção */}
      <section className="professor-section">
        <div className="section-header">
          <h2>Conteúdos que precisam de atenção</h2>
        </div>

        {topicPerformance.length === 0 ? (
          <div className="professor-empty">
            <h3>Sem dados ainda</h3>
            <p>
              Quando os alunos responderem às questões ou simulados,
              os assuntos com menor percentual de acertos aparecerão aqui.
            </p>
          </div>
        ) : (
          <ul className="professor-list">
            {topicPerformance.map((item) => (
              <li key={`${item.subject}-${item.topic}`}>
                <div>
                  <span>{item.subject.toUpperCase()}</span>
                  <p>{item.topic}</p>
                  <small>
                    {item.correct} acertos em {item.total} respostas
                  </small>
                </div>

                <span>{item.accuracy}% de acertos</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Conteúdos recentes */}
      <section className="professor-section">
        <div className="section-header">
          <h2>Conteúdos recentes</h2>
        </div>

        {atividadesRecentes.length === 0 ? (
          <div className="professor-empty">
            <h3>Nenhum conteúdo cadastrado</h3>
            <p>
              As atividades, questões e simulados criados por você
              aparecerão aqui.
            </p>
          </div>
        ) : (
          <ul className="professor-list">
            {atividadesRecentes.map((item) => (
              <li key={item.id}>
                <div>
                  <span>{item.type.toUpperCase()}</span>
                  <p>{item.title}</p>
                  <small>{formatDate(item.date)}</small>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
