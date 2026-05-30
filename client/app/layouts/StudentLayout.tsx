import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router";

export default function StudentLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (!token || !userStr) {
      navigate("/auth", { replace: true });
      return;
    }
    const user = JSON.parse(userStr);
    if (user.role !== "STUDENT") {
      navigate("/auth", { replace: true });
      return;
    }
    setUser(user);
  }, [navigate]);

  if (!user) {
    return null; // or a loading spinner
  }

  return <Outlet context={{ user }} />;
}