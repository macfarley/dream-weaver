import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { isSelf } from "../../services/userService";
import Loading from "./Loading";

function UserRedirect() {
  const { userId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.resolve().then(() => {
      if (isSelf(userId)) {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    });
  }, [userId, navigate]);

  return <Loading message="Redirecting you..." />;
}

export default UserRedirect;
