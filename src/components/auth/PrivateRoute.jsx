import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../../contexts/UserContext";

function PrivateRoute({ children }) {
  const { user, loading } = useContext(UserContext);
  if (loading) return null; // or a spinner
  if (!user) return <Navigate to="/join" />;
  return children;
}

export default PrivateRoute;
