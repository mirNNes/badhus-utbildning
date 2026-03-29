import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { getAllModules } from "../modules/registry";
import { routes } from "../routes";
import "../styles/modules.css";
import "../styles/global.css";

export default function Modules() {
  const modules = getAllModules();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const isReviewMode = searchParams.get("review") === "true";

  return (
    <div className="page-container">
      <main className="content-wrapper">
        <h1 className="page-title">Moduler</h1>

              {isReviewMode && (
        <div className="review-note">
          <strong>REPETITIONSLÄGE</strong>
          <span>Välj valfri modul</span>
        </div>
      )}

        <div className="modules-grid">
          {modules.map((m) => (
            <Link
              key={m.id}
              to={
                isReviewMode
                  ? `${routes.module(m.id)}?review=true`
                  : routes.module(m.id)
              }
              className="module-card"
            >
              <div className="module-title">{m.title}</div>
              <div className="module-version">Version {m.version}</div>
            </Link>
          ))}
        </div>

        <div className="modules-back-row">
          <button
            onClick={() => navigate(routes.start)}
            className="modules-back-btn"
            type="button"
          >
            ← Till startsidan
          </button>
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
