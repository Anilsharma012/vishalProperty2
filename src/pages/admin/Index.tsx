import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Dashboard from "./Dashboard";
import Properties from "./Properties";
import Leads from "./Leads";
import Settings from "./Settings";
import Login from "./Login";

const AdminIndex = () => {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="login" element={<Login />} />
      {isAdmin ? (
        <>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="properties" element={<Properties />} />
          <Route path="leads" element={<Leads />} />
          <Route path="settings" element={<Settings />} />
        </>
      ) : (
        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      )}
    </Routes>
  );
};

export default AdminIndex;
