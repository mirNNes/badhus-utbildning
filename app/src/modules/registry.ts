// src/modules/registry.ts
import type { ModuleContent } from "./types";

const contentLoaders = import.meta.glob("./*/content.json", { eager: true });

export const MODULE_ORDER = [
  "torra-ytor",
  "duschutrymme",
  "bassang",
  "bastu",
  "leksaker",
  "underhall",
  "kvallstad",
] as const;

function getIdFromPath(path: string) {
  return path.split("/")[1];
}

export function isLastModule(id: string): boolean {
  return MODULE_ORDER.indexOf(id as any) === MODULE_ORDER.length - 1;
}

function makeIntroSlide(moduleTitle: string, moduleId: string) {
  const idx = MODULE_ORDER.indexOf(moduleId as any);
  const pos = idx >= 0 ? idx + 1 : 0;
  const total = MODULE_ORDER.length;

  const nextText = isLastModule(moduleId)
    ? "När du klarar quizet kan du skapa ditt certifikat."
    : "Gå vidare till nästa modul efter godkänt quiz.";

  return {
    id: "intro",
    type: "content",
    variant: "intro",
    title: moduleTitle,
    body: `[BADGE] MODUL ${pos} AV ${total}

Du går nu in i modulen ${moduleTitle}. Här får du steg för steg lära dig rätt arbetssätt, viktiga kontrollpunkter och vad du behöver tänka på i praktiken.

[CARD] SÅ FUNKAR MODULEN
- Läs texten i varje slide
- Bläddra igenom alla bilder
- Gå vidare när steget är klart

[CARD-YELLOW] MÅLET MED MODULEN
- Förstå rätt metod och ordning
- Känna igen risker och vanliga fel
- Klara quizet för att gå vidare

[CARD] NÄR DU ÄR KLAR
- Gör quizet i slutet av modulen
- ${nextText}`,
    images: [
      {
        src: `/modules/${moduleId}/images/intro.png`,
        alt: `Introduktion till ${moduleTitle}`,
        caption: `Städmoment i ${moduleTitle}`,
      },
    ],
  };
}

export function getAllModules(): ModuleContent[] {
  const modules: ModuleContent[] = Object.entries(contentLoaders).map(
    ([path, mod]: [string, any]) => {
      const data = mod.default ?? mod;
      const id = getIdFromPath(path);
      const moduleData: any = { ...data, id };

      if (!moduleData.slides?.some((s: any) => s.id === "intro")) {
        moduleData.slides = [
          makeIntroSlide(moduleData.title ?? id, id),
          ...(moduleData.slides ?? []),
        ];
      }

      return moduleData as ModuleContent;
    }
  );

  modules.sort(
    (a, b) =>
      MODULE_ORDER.indexOf(a.id as any) - MODULE_ORDER.indexOf(b.id as any)
  );

  return modules;
}

export function getModuleById(id: string): ModuleContent | undefined {
  return getAllModules().find((m) => m.id === id);
}

export function getPreviousModuleId(currentId: string): string | null {
  const idx = MODULE_ORDER.indexOf(currentId as any);
  if (idx <= 0) return null;
  return MODULE_ORDER[idx - 1];
}

export function getNextModuleId(currentId: string): string | null {
  const idx = MODULE_ORDER.indexOf(currentId as any);
  if (idx === -1 || idx >= MODULE_ORDER.length - 1) return null;
  return MODULE_ORDER[idx + 1];
}
