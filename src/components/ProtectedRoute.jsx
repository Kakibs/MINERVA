import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedType }) {
const savedUser = localStorage.getItem("minervaLoggedUser");

if (!savedUser) {
return <Navigate to="/login" replace />;
}

let user;

try {
user = JSON.parse(savedUser);
} catch {
localStorage.removeItem("minervaLoggedUser");
return <Navigate to="/login" replace />;
}

if (user.userType !== allowedType) {
if (user.userType === "aluno") {
return <Navigate to="/" replace />;
}

if (user.userType === "professor") {
  return <Navigate to="/professor" replace />;
}

if (user.userType === "admin") {
  return <Navigate to="/admin" replace />;
}

localStorage.removeItem("minervaLoggedUser");
return <Navigate to="/login" replace />;

}

return children;
}

export default ProtectedRoute;