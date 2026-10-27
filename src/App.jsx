
import "./App.css";
import { useState } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import ProfessorLayout from "./components/ProfessorLayout";
import AdminLayout from "./components/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import Cronograma from "./pages/Cronograma";
import Atividades from "./pages/Atividades";
import Questoes from "./pages/Questoes";
import Redacao from "./pages/Redacao";
import Simulados from "./pages/Simulados";
import Desempenho from "./pages/Desempenho";

import PerfilAluno from "./pages/PerfilAluno";
import PerfilProfessor from "./pages/PerfilProfessor";
import PerfilAdmin from "./pages/PerfilAdmin";

import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";

import ProfessorDashboard from "./pages/ProfessorDashboard";
import ProfessorTurmas from "./pages/ProfessorTurmas";
import ProfessorAtividades from "./pages/ProfessorAtividades";
import ProfessorQuestoes from "./pages/ProfessorQuestoes";
import ProfessorRedacoes from "./pages/ProfessorRedacoes";
import ProfessorSimulados from "./pages/ProfessorSimulados";
import ProfessorDesempenho from "./pages/ProfessorDesempenho";
import ProfessorCronograma from "./pages/ProfessorCronograma";

import AdminDashboard from "./pages/AdminDashboard";
import AdminAlunos from "./pages/AdminAlunos";
import AdminProfessores from "./pages/AdminProfessores";
import AdminTurmas from "./pages/AdminTurmas";
import AdminCronograma from "./pages/AdminCronograma";
import AdminAutorizacoes from "./pages/AdminAutorizacoes";


function StudentLayout() {
  const [menuAberto, setMenuAberto] = useState(false);

  function fecharMenu() {
    setMenuAberto(false);
  }

  function alternarMenu() {
    setMenuAberto((aberto) => !aberto);
  }

  return (
    <ProtectedRoute allowedType="aluno">
      <div className="app">
        <Sidebar
          isOpen={menuAberto}
          onClose={fecharMenu}
        />

        {menuAberto && (
          <button
            type="button"
            className="minerva-mobile-overlay"
            aria-label="Fechar menu de navegação"
            onClick={fecharMenu}
          />
        )}

        <div className="main-content">
         <Header
  onMenuClick={alternarMenu}
  menuAberto={menuAberto}
/>

          <Routes>
            <Route
              path="/"
              element={<Navigate to="/dashboard" replace />}
            />

            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="/cronograma"
              element={<Cronograma />}
            />

            <Route
              path="/atividades"
              element={<Atividades />}
            />

            <Route
              path="/questoes"
              element={<Questoes />}
            />

            <Route
              path="/redacao"
              element={<Redacao />}
            />

            <Route
              path="/simulados"
              element={<Simulados />}
            />

            <Route
              path="/desempenho"
              element={<Desempenho />}
            />

            <Route
              path="/perfil"
              element={<PerfilAluno />}
            />

            <Route
              path="*"
              element={<Navigate to="/dashboard" replace />}
            />
          </Routes>
        </div>
      </div>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/cadastro"
          element={<Cadastro />}
        />

        <Route
          path="/professor"
          element={
            <ProtectedRoute allowedType="professor">
              <ProfessorLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ProfessorDashboard />} />
          <Route path="turmas" element={<ProfessorTurmas />} />
          <Route path="atividades" element={<ProfessorAtividades />} />
          <Route path="questoes" element={<ProfessorQuestoes />} />
          <Route path="redacoes" element={<ProfessorRedacoes />} />
          <Route path="simulados" element={<ProfessorSimulados />} />
          <Route path="desempenho" element={<ProfessorDesempenho />} />
          <Route path="cronograma" element={<ProfessorCronograma />} />
          <Route path="perfil" element={<PerfilProfessor />} />
        </Route>

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedType="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="alunos" element={<AdminAlunos />} />
          <Route path="professores" element={<AdminProfessores />} />
          <Route path="turmas" element={<AdminTurmas />} />
          <Route path="cronograma" element={<AdminCronograma />} />
          <Route path="autorizacoes" element={<AdminAutorizacoes />} />
          <Route path="perfil" element={<PerfilAdmin />} />
        </Route>

        <Route path="/*" element={<StudentLayout />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
