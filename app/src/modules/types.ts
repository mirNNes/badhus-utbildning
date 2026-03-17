export type SlideBase = {
  id: string;
  title?: string;
};

export type TextSlide = SlideBase & {
  type: "text";
  body: string;
  bullets?: string[];
};

export type ImageSlide = SlideBase & {
  type: "image";
  src: string;
  alt: string;
  caption?: string;
};

export type VideoSlide = SlideBase & {
  type: "video";
  src: string;
  caption?: string;
  autoNext?: boolean; // default true
};

export type QuestionOption = { id: string; label: string };

export type QuestionSlide = SlideBase & {
  type: "question";
  prompt: string;
  options: QuestionOption[];
  correctOptionId: string;
  explanationCorrect?: string;
  explanationWrong?: string;
  lockAfterAnswer?: boolean; // default true
};

/* -------------------- GALLERY -------------------- */

export type GalleryImage = {
  src: string;
  alt: string;
  caption?: string;
};

export type GallerySlide = SlideBase & {
  type: "gallery";
  images: GalleryImage[];
};

/* -------------------- CONTENT (NY) -------------------- */
// Text + flera bilder i samma slide

export type ContentSlide = SlideBase & {
  type: "content";
  body: string;
  bullets?: string[]; // valfritt om du vill kunna ha bullets även här
  images: GalleryImage[];
};

/* ------------------------------------------------------ */

export type Slide =
  | TextSlide
  | ImageSlide
  | VideoSlide
  | QuestionSlide
  | GallerySlide
  | ContentSlide;

export type ModuleContent = {
  id: string;
  title: string;
  version: string;

  description?: string;
  durationMinutes?: number;
  backgroundImage?: string;

  slides: Slide[];
};
