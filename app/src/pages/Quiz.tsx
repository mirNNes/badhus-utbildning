import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getNextModuleId, isLastModule } from "../modules/registry";
import { routes } from "../routes";

// Importera den nya stilen
import "../styles/Quiz.css";

// Fix för loaders: Se till att vi hittar filerna
const quizLoaders = import.meta.glob("../modules/*/quiz.json", { eager: true });

type Question = {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
};

type QuizData = {
  passScore: number;
  questions: Question[];
};

// Hjälpfunktion för att blanda en array (Fisher-Yates shuffle)
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function Quiz() {
  const navigate = useNavigate();
  const { moduleId } = useParams<{ moduleId: string }>();

  // State för animation och feedback
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; clickedIndex: number } | null>(null);

  // Blanda frågor och svar EN gång per modul-laddning
  const data = useMemo(() => {
    if (!moduleId) return null;
    const key = `../modules/${moduleId}/quiz.json`;
    const mod: any = quizLoaders[key];
    if (!mod) return null;
    
    const originalData = (mod.default ?? mod) as QuizData;

    // 1. Blanda frågorna
    const shuffledQuestions = shuffleArray(originalData.questions).map(q => {
      // 2. Skapa objekt för att hålla koll på rätt svar innan vi blandar alternativen
      const optionsWithMeta = q.options.map((opt, idx) => ({
        text: opt,
        isCorrect: idx === q.correctIndex
      }));
      
      const shuffledOptions = shuffleArray(optionsWithMeta);
      
      return {
        ...q,
        options: shuffledOptions.map(o => o.text),
        // Hitta det nya indexet för det rätta svaret efter shuffle
        correctIndex: shuffledOptions.findIndex(o => o.isCorrect)
      };
    });

    return {
      ...originalData,
      questions: shuffledQuestions
    };
  }, [moduleId]);

const finish = (finalScore: number) => {
  if (!data || !moduleId) return;
  const total = data.questions.length;
  const passed = finalScore >= data.passScore;

  if (!passed) {
    navigate(routes.certificate, {
      state: {
        passed,
        score: finalScore,
        total,
        moduleId,
      },
    });
    return;
  }

  if (isLastModule(moduleId)) {
    navigate(routes.certificate, {
      state: {
        passed,
        score: finalScore,
        total,
        moduleId,
      },
    });
    return;
  }

  const nextId = getNextModuleId(moduleId);
  if (nextId) navigate(routes.module(nextId));
  else navigate(routes.modules);
};

  const handleAnswer = (index: number) => {
    if (!data || feedback) return; // Förhindra klick under animation

    const question = data.questions[current];
    const isCorrect = index === question.correctIndex;
    
    // Aktivera feedback (färg/skak)
    setFeedback({ isCorrect, clickedIndex: index });

    // Pausa kort så användaren hinner se resultatet
    setTimeout(() => {
      const newScore = score + (isCorrect ? 1 : 0);

      if (current + 1 < data.questions.length) {
        setScore(newScore);
        setCurrent(current + 1);
        setFeedback(null); // Nollställ feedback inför nästa fråga
      } else {
        finish(newScore);
      }
    }, 800);
  };

  if (!moduleId || !data) {
    return (
      <div className="quiz-container">
        <div className="quiz-card error-state">
          <h2 className="quiz-question">Hittar inget quiz</h2>
          <button className="quiz-option-btn" onClick={() => navigate(routes.modules)}>
            TILL MODULER
          </button>
        </div>
      </div>
    );
  }

  const question = data.questions[current];

  return (
    <div className="quiz-container">
      <div className="quiz-card">
        <div className="quiz-header">
          <div className="quiz-title">TESTa DINA KUNSKAPER</div>
          <div className="quiz-progress">
            FRÅGA {current + 1} AV {data.questions.length}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="quiz-progress-bar-track">
          <div 
            className="quiz-progress-bar-fill" 
            style={{ width: `${((current + 1) / data.questions.length) * 100}%` }}
          />
        </div>

        <h3 className="quiz-question">{question.question}</h3>

        <div className="quiz-options">
          {question.options.map((option, i) => {
            // Logik för att sätta CSS-klasser vid feedback
            let statusClass = "";
            if (feedback) {
              if (i === question.correctIndex) statusClass = "correct-flash";
              else if (i === feedback.clickedIndex && !feedback.isCorrect) statusClass = "wrong-flash";
            }

            return (
              <button
                key={`${current}-${i}`}
                className={`quiz-option-btn ${statusClass}`}
                onClick={() => handleAnswer(i)}
                disabled={!!feedback}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
