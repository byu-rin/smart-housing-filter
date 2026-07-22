import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Layout from "./layout/Layout";
import MaeipPage from "./categories/maeip/MaeipPage";
import AnsimLayout from "./categories/ansim/AnsimLayout";
import PublicPage from "./categories/ansim/ansim-public/PublicPage";
import PrivatePage from "./categories/ansim/ansim-private/PrivatePage";

function App() {
  useEffect(() => {
    toast.info("환영합니다!");
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/housing/maeip" replace />} />

          {/* 청년매입임대 */}
          <Route path="housing/maeip" element={<MaeipPage />} />

          {/* 청년안심주택 (중첩 라우팅) */}
          <Route path="housing/ansim" element={<AnsimLayout />}>
            <Route index element={<Navigate to="public" replace />} />
            <Route path="public" element={<PublicPage />} />
            <Route path="private" element={<PrivatePage />} />
          </Route>
        </Route>
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={6000}
        theme="light"
      />
    </BrowserRouter>
  );
}

export default App;
