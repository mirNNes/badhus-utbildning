import { useNavigate } from "react-router-dom";
import { appInfo } from "../appInfo";
import "../styles/start.css";
import { getAllModules } from "../modules/registry"; // ✅ lägg till
import { routes } from "../routes";

export default function Start() {
  const navigate = useNavigate();

  const startTraining = () => {
  const first = getAllModules()[0];
  if (first) navigate(routes.module(first.id));
};

  return (
    <div className="start-container">
      <section className="hero">
        <div className="hero-overlay">
          <h1>{appInfo.appName}</h1>
          <p className="hero-subtitle">
            Introduktion och repetition av städning och underhåll i badhusmiljö
          </p>
          <p className="start-version">
            Kurs: {appInfo.courseName} • Version: {appInfo.version}
          </p>

          <div className="start-actions">
            <button className="primary-btn" onClick={startTraining}>
              Starta utbildning
            </button>
          </div>
        </div>
      </section>

      <section className="info-card">
        <h2>Syfte med utbildningen</h2>
        <p>
          Syftet med utbildningen är att ge dig som dagligen arbetar med städning
          som en del av badvärdsuppdraget en tydlig och kortfattad genomgång av
          viktiga moment inom städning och underhåll av en badanläggning.
          Utbildningen bygger på Svenska Badbranschens rekommendationer för
          städning i våta utrymmen och är samtidigt anpassad utifrån praktisk
          erfarenhet och yrkeskunskap inom lokalvård.
        </p>
        <p>
          Målet är att säkerställa att alla medarbetare har en gemensam
          förståelse för städkvalitet och hygienkrav. När vi delar samma syn på
          kvalitet minskar de hygieniska riskerna i bassängmiljön och vi skapar
          ett tydligt, tryggt och säkert arbetssätt.
        </p>
      </section>

      <footer className="start-footer">
        <p>
          Utvecklad av <strong>Mirnes Mrso</strong> © {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
