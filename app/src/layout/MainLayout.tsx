// src/layout/MainLayout.tsx
import { Outlet } from "react-router-dom";
import "../styles/layout.css";

export default function MainLayout() {
  const withBase = (src: string) =>
    src.startsWith("/")
      ? `${import.meta.env.BASE_URL}${src.slice(1)}`
      : src;

  const bg = withBase("/modules/bassang/images/bakgrund.png");

  return (
    <div className="app-container">
      <header className="app-header"></header>

      <div className="app-body">
        <div className="side left" style={{ background: "red", minHeight: 200 }}>
          <img src={bg} alt="" />
        </div>

        <main className="app-main">
          <Outlet />
        </main>

        <div className="side right">
          <img src={bg} alt="" />
        </div>
      </div>
    </div>
  );
}
