import "./Redacoes.css";
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

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function Redacoes() {
  const user = readObject("minervaLoggedUser");
  const studentSubjects = user?.subjects || [];

  const [redacoes] = useState(() => readList("minervaRedacoes"));

  const [submissions, setSubmissions] = useState(() =>
    readList("minervaEntregasRedacoes")
  );

  const [corrections, setCorrections] = useState(() =>
    readList("minervaCorrecoesRedacoes")
  );

  const [selected, setSelected] = useState(null);
  const [text, setText] = useState("");
  const [keptAttachments, setKeptAttachments] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const studentRedacoes = redacoes.filter((item) =>
    studentSubjects.includes(item.subject)
  );

  function getSubmission(redacaoId) {
    return submissions.find(
      (item) =>
        item.redacaoId === redacaoId &&
        item.studentId === user?.id
    );
  }

  function getCorrection(submissionId) {
    return corrections.find(
      (item) => item.submissionId === submissionId
    );
  }

  function getStatus(redacaoId) {
    const submission = getSubmission(redacaoId);

    if (!submission) {
      return "Não enviada";
    }

    return getCorrection(submission.id)
      ? "Corrigida"
      : "Enviada";
  }

  function formatDate(dateValue) {
    if (!dateValue) {
      return "";
    }

    const parts = dateValue.split("-");

    if (parts.length !== 3) {
      return dateValue;
    }

    return parts[2] + "/" + parts[1] + "/" + parts[0];
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

  function formatGrade(value) {
    return String(value).replace(".", ",");
  }

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

    return (size / (1024 * 1024)).toFixed(1) + " MB";
  }

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

  function openRedacao(redacao) {
    const submission = getSubmission(redacao.id);

    setSelected(redacao);
    setText(submission?.text || "");
    setKeptAttachments(submission?.attachments || []);
    setNewFiles([]);
    setError("");
    setSuccess("");
  }

  function closePanel() {
    setSelected(null);
    setText("");
    setKeptAttachments([]);
    setNewFiles([]);
    setError("");
    setSuccess("");
  }

  function handleFileChange(event) {
    const files = Array.from(event.target.files || []);
    const validFiles = [];
    const tooBig = [];

    for (const file of files) {
      if (file.size > 2 * 1024 * 1024) {
        tooBig.push(file.name);
        continue;
      }

      validFiles.push(file);
    }

    if (tooBig.length > 0) {
      setError(
        "Cada arquivo pode ter no máximo 2 MB. Não foi adicionado: " +
          tooBig.join(", ")
      );
    } else {
      setError("");
    }

    setNewFiles((current) => [...current, ...validFiles]);
    setSuccess("");

    event.target.value = "";
  }

  function removeNewFile(fileIndex) {
    setNewFiles((current) =>
      current.filter((_, index) => index !== fileIndex)
    );
  }

  function removeKeptAttachment(fileIndex) {
    setKeptAttachments((current) =>
      current.filter((_, index) => index !== fileIndex)
    );
  }

  function fileToAttachment(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        resolve({
          name: file.name,
          type: file.type,
          size: file.size,
          dataUrl: reader.result,
        });
      };

      reader.onerror = () => {
        reject(new Error("Erro ao ler arquivo."));
      };

      reader.readAsDataURL(file);
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!selected) {
      return;
    }

    if (!user?.id) {
      setError("Não foi possível identificar o aluno logado.");
      return;
    }

    if (
      !text.trim() &&
      keptAttachments.length === 0 &&
      newFiles.length === 0
    ) {
      setError(
        "Escreva sua redação ou anexe pelo menos um arquivo."
      );
      return;
    }

    const currentSubmission = getSubmission(selected.id);
    const currentCorrection = currentSubmission
      ? getCorrection(currentSubmission.id)
      : null;

    if (currentCorrection) {
      const confirmed = window.confirm(
        "Esta redação já foi corrigida. Se você atualizar a entrega, a nota e o feedback do professor serão removidos e a redação voltará para correção. Deseja continuar?"
      );

      if (!confirmed) {
        return;
      }
    }

    try {
      const convertedFiles = [];

      for (const file of newFiles) {
        convertedFiles.push(await fileToAttachment(file));
      }

      const attachments = [
        ...keptAttachments,
        ...convertedFiles,
      ];

      const newSubmission = {
        id:
          currentSubmission?.id ||
          "entrega-redacao-" +
            selected.id +
            "-" +
            user.id,

        redacaoId: selected.id,
        redacaoTitle: selected.title,
        subject: selected.subject,
        studentId: user.id,
        studentName: user.name || "Aluno",
        studentEmail: user.email || "",
        text: text.trim(),
        attachments: attachments,
        submittedAt: new Date().toISOString(),
      };

      const otherSubmissions = submissions.filter(
        (item) =>
          !(
            item.redacaoId === selected.id &&
            item.studentId === user.id
          )
      );

      const updatedSubmissions = [
        ...otherSubmissions,
        newSubmission,
      ];

      if (
        !persist(
          "minervaEntregasRedacoes",
          updatedSubmissions
        )
      ) {
        setError(
          "Não foi possível salvar: o armazenamento do navegador está cheio. Tente enviar menos ou menores arquivos."
        );
        return;
      }

      let updatedCorrections = corrections;

      if (currentCorrection) {
        updatedCorrections = corrections.filter(
          (correction) =>
            correction.submissionId !== currentSubmission.id
        );

        if (
          !persist(
            "minervaCorrecoesRedacoes",
            updatedCorrections
          )
        ) {
          setError(
            "A entrega foi salva, mas não foi possível atualizar o status da correção."
          );
          return;
        }

        setCorrections(updatedCorrections);
      }

      setSubmissions(updatedSubmissions);
      setKeptAttachments(attachments);
      setNewFiles([]);

      setSuccess(
        currentSubmission
          ? currentCorrection
            ? "Entrega atualizada. A redação voltou para correção."
            : "Entrega atualizada com sucesso."
          : "Redação enviada com sucesso."
      );
    } catch {
      setError("Não foi possível enviar os arquivos.");
    }
  }

  return (
    <main className="page redacoes-page">
      <section className="page-header">
        <p className="page-label">REDAÇÕES</p>

        <h1>Minhas redações</h1>

        <p>
          Acompanhe as propostas de redação das disciplinas que
          você está cursando.
        </p>
      </section>

      <section className="content-section">
        {studentRedacoes.length === 0 ? (
          <div className="empty-state">
            <h2>Nenhuma redação</h2>

            <p>
              Ainda não existem propostas de redação para as
              disciplinas que você está cursando.
            </p>
          </div>
        ) : (
          <div className="activity-list">
            {studentRedacoes.map((redacao) => {
              const status = getStatus(redacao.id);

              return (
                <article
                  className="activity-card"
                  key={redacao.id}
                >
                  <div className="activity-main">
                    <span className="activity-subject">
                      {redacao.subject}
                    </span>

                    <h2>{redacao.title}</h2>

                    <p>{redacao.prompt}</p>

                    {redacao.instructions && (
                      <p>
                        <strong>Instruções:</strong>{" "}
                        {redacao.instructions}
                      </p>
                    )}
                  </div>

                  <div className="activity-meta">
                    <span>PRAZO</span>

                    <strong>
                      {formatDate(redacao.deadline)}
                    </strong>

                    {status === "Não enviada" ? (
                      <small>{status}</small>
                    ) : status === "Enviada" ? (
                      <strong className="activity-submitted-label">
                        ✓ Enviada
                      </strong>
                    ) : (
                      <strong className="activity-submitted-label">
                        ✓ Corrigida
                      </strong>
                    )}

                    <button
                      type="button"
                      className="activity-submit-button"
                      onClick={() => openRedacao(redacao)}
                    >
                      {status === "Não enviada"
                        ? "Escrever redação"
                        : "Ver minha entrega"}
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
                <span>{selected.subject}</span>

                <h2>{selected.title}</h2>

                <p>{selected.prompt}</p>

                {selected.instructions && (
                  <p>{selected.instructions}</p>
                )}

                <p>
                  Prazo: {formatDate(selected.deadline)}
                </p>
              </div>

              <button
                type="button"
                onClick={closePanel}
              >
                Fechar
              </button>
            </div>

            {(() => {
              const submission = getSubmission(selected.id);

              const correction = submission
                ? getCorrection(submission.id)
                : null;

              return (
                <>
                  {correction && (
                    <div className="student-correction">
                      <div className="student-correction-header">
                        <div>
                          <span>
                            REDAÇÃO CORRIGIDA
                          </span>

                          <h2>
                            Sua redação foi corrigida
                          </h2>
                        </div>

                        {correction.grade !== null && (
                          <strong>
                            {formatGrade(
                              correction.grade
                            )}
                          </strong>
                        )}
                      </div>

                      {correction.grade !== null && (
                        <p className="student-correction-grade">
                          Nota
                        </p>
                      )}

                      {correction.feedback && (
                        <div className="student-correction-feedback">
                          <span>
                            FEEDBACK DO PROFESSOR
                          </span>

                          <p
                            style={{
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            {correction.feedback}
                          </p>
                        </div>
                      )}

                      <small>
                        Corrigida em{" "}
                        {formatDateTime(
                          correction.correctedAt
                        )}
                      </small>
                    </div>
                  )}

                  {submission && (
                    <div className="student-existing-submission">
                      <span>SUA ENTREGA</span>

                      <p>
                        Enviada em{" "}
                        {formatDateTime(
                          submission.submittedAt
                        )}
                        . Você pode atualizar a entrega
                        abaixo.
                      </p>
                    </div>
                  )}

                  <form
                    className="activity-submit-form"
                    onSubmit={handleSubmit}
                  >
                    <label>
                      Texto da redação

                      <textarea
                        rows="14"
                        placeholder="Escreva sua redação aqui..."
                        value={text}
                        onChange={(event) => {
                          setText(event.target.value);
                          setSuccess("");
                        }}
                      />
                    </label>

                    <label>
                      Anexar redação

                      <input
                        type="file"
                        multiple
                        accept="image/*,.pdf,.doc,.docx,.txt"
                        onChange={handleFileChange}
                      />

                      <small>
                        Foto do caderno, imagem ou PDF. Você
                        pode enviar vários arquivos, de até
                        2 MB cada.
                      </small>
                    </label>

                    {keptAttachments.length > 0 && (
                      <div className="activity-attachments">
                        <span className="activity-attachments-title">
                          ARQUIVOS JÁ ENVIADOS
                        </span>

                        <div className="activity-file-list">
                          {keptAttachments.map(
                            (attachment, index) => (
                              <div
                                className="activity-file-item"
                                key={
                                  attachment.name +
                                  "-" +
                                  index
                                }
                              >
                                <div>
                                  <strong>
                                    {attachment.name}
                                  </strong>

                                  <small>
                                    {formatFileSize(
                                      attachment.size
                                    )}
                                  </small>
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    openAttachment(
                                      attachment
                                    )
                                  }
                                >
                                  Abrir
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    removeKeptAttachment(
                                      index
                                    )
                                  }
                                >
                                  Remover
                                </button>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {newFiles.length > 0 && (
                      <div className="activity-file-list">
                        {newFiles.map((file, index) => (
                          <div
                            className="activity-file-item"
                            key={
                              file.name + "-" + index
                            }
                          >
                            <div>
                              <strong>
                                {file.name}
                              </strong>

                              <small>
                                {formatFileSize(
                                  file.size
                                )}
                              </small>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                removeNewFile(index)
                              }
                            >
                              Remover
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {error && (
                      <p className="login-error">
                        {error}
                      </p>
                    )}

                    {success && (
                      <div className="student-existing-submission">
                        <span>REDAÇÃO</span>

                        <p>{success}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="activity-submit-button"
                    >
                      {submission
                        ? "Atualizar entrega"
                        : "Enviar redação"}
                    </button>
                  </form>
                </>
              );
            })()}
          </div>
        </section>
      )}
    </main>
  );
}

export default Redacoes;