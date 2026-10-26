const users = [
  {
    id: 1,
    name: "Karol",
    email: "karol@minerva.com",
    password: "123456",
    userType: "admin",
    status: "ativo",
    subjects: [],
  },

  {
    id: 2,
    name: "Aluno Teste",
    email: "aluno@minerva.com",
    password: "123456",
    userType: "aluno",
    status: "ativo",
    subjects: ["Matemática", "Português"],
  },

  {
    id: 3,
    name: "Professora Teste",
    email: "professor@minerva.com",
    password: "123456",
    userType: "professor",
    status: "pendente",
    subjects: ["Matemática"],
  },
];

export default users;