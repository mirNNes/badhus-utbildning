import { Link } from "react-router-dom";
import { getAllModules } from "../modules/registry";
import { routes } from "../routes";
import "../styles/modules.css";
import "../styles/global.css";

export default function Modules() {
  const modules = getAllModules();

  return (
    <div className="page-container">
      {/* Main-taggen tar upp allt ledigt utrymme och trycker ner footern */}
      <main className="content-wrapper">
        <h1 className="page-title">Moduler</h1>

        <div className="modules-grid">
          {modules.map((m) => (
            <Link
              key={m.id}
              to={routes.module(m.id)}
              className="module-card"
            >
              <div className="module-title">{m.title}</div>
              <div className="module-version">Version {m.version}</div>
            </Link>
          ))}
        </div>
      </main>

      <footer className="start-footer">
        <p>
          Utvecklad av <strong>Mirnes Mrso</strong> © {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
