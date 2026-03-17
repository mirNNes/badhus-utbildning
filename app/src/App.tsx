// src/App.tsx
import { Routes, Route } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import Modules from "./pages/Modules";
import ModuleView from "./pages/ModuleView";
import Quiz from "./pages/Quiz";
import Start from "./pages/Start";
import Certificate from "./pages/Certificate";

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Start />} />
        <Route path="/modules" element={<Modules />} />
        <Route path="/modules/:id" element={<ModuleView />} />
        <Route path="/quiz/:moduleId" element={<Quiz />} />
        <Route path="/certificate" element={<Certificate />} />
      </Route>
    </Routes>
  );
}
