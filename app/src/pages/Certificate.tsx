import { useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { routes } from "../routes";
import { downloadPdf, generateCertificatePdf } from "../pdf/generateCertificate";
import "../styles/Certificate.css";

export default function Certificate() {
  const location = useLocation();
  const navigate = useNavigate();

  const { passed, score, total, moduleId } = useMemo(() => {
    const s = location.state || {};
    return {
      passed: Boolean(s.passed),
      score: Number(s.score ?? 0),
      total: Number(s.total ?? 10),
      moduleId: String(s.moduleId ?? ""),
    };
  }, [location.state]);

  const [fullName, setFullName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!passed) {
    return (
      <div className="certificate-container">
        <div className="certificate-card error-state">
          <h2 className="certificate-title">Underkänd</h2>
          <p>Du behöver repetera modulen och göra om testet.</p>
          <button
            className="btn-generate"
            onClick={() =>
              moduleId
                ? navigate(`/modules/${moduleId}`)
                : navigate(routes.modules)
            }
          >
            TILL MODULEN
          </button>
        </div>
      </div>
    );
  }

  const onGenerate = async () => {
    setError(null);
    const name = fullName.trim();
    if (name.length < 2) {
      setError("Skriv ditt för- och efternamn.");
      return;
    }

    try {
      setIsGenerating(true);
      const { bytes } = await generateCertificatePdf({
        fullName: name,
        score,
        total,
      });

      const safe = name.replace(/[^\p{L}\p{N}\s_-]/gu, "").replace(/\s+/g, "_");
      downloadPdf(bytes, `Certifikat_${safe}.pdf`);
      setFullName("");
    } catch (e) {
      setError("Kunde inte skapa certifikatet. Försök igen.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="certificate-container">
      <div className="certificate-card">
        <h2 className="certificate-title">Godkänd!</h2>
        <div className="certificate-score">Resultat: {score}/{total}</div>

        <div className="certificate-form">
          <div className="certificate-input-group">
            <label className="certificate-label">Namn för certifikat:</label>
            <input
              className="certificate-input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="FÖRNAMN EFTERNAMN"
            />
            {error && <p className="certificate-error">{error}</p>}
          </div>

          <div className="certificate-actions">
            <button
              className="btn-generate"
              onClick={onGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? "SKAPAR PDF..." : "SKAPA CERTIFIKAT (PDF)"}
            </button>

            <button
              className="btn-back"
              onClick={() => navigate(routes.start)}
            >
              TILL START
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
