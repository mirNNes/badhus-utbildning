import { useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { getModuleById } from "../modules/registry";
import SlidePlayer from "../components/SlidePlayer";
//import { hasPassed } from "../progress";
import { routes } from "../routes";

export default function ModuleView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isReviewMode = searchParams.get("review") === "true";

  const content = useMemo(() => (id ? getModuleById(id) : undefined), [id]);

  if (!content) {
    return (
      <div style={{ padding: 24 }}>
        <h2>Modulen hittades inte</h2>
        <p>Kontrollera att content.json finns och att id matchar URL:en.</p>
      </div>
    );
  }

  // const prevId = getPreviousModuleId(content.id);
  // if (prevId && !hasPassed(prevId)) {
  //   return <Navigate to={routes.module(prevId)} replace />;
  // }

  return (
    <SlidePlayer
      slides={content.slides}
      isReviewMode={isReviewMode}
      onFinish={() => {
        if (isReviewMode) {
          navigate(`${routes.modules}?review=true`);
        } else {
          navigate(routes.quiz(content.id));
        }
      }}
    />
  );
}
