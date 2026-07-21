import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./layout/Layout";
import { CATEGORIES } from "./categories";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/maeip" replace />} />
          {CATEGORIES.map((c) => (
            <Route key={c.key} path={c.path} element={c.element} />
          ))}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
