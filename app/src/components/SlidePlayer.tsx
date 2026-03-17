import React, { useEffect, useMemo, useState } from "react";
import type { Slide } from "../modules/types";
import "../styles/SlidePlayer.css";

type Props = {
  slides: Slide[];
  onFinish: () => void;
};

type GalleryImage = {
  src: string;
  alt?: string;
  caption?: string;
  text?: string;
};

function preloadImage(url: string) {
  return new Promise<void>((resolve) => {
    if (!url) return resolve();
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = url;
  });
}

function splitLines(text: string) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export default function SlidePlayer({ slides, onFinish }: Props) {
  const [index, setIndex] = useState(0);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [preloadReady, setPreloadReady] = useState(true);
  const [seenImages, setSeenImages] = useState<Set<number>>(new Set([0]));

  const total = slides.length;
  const current = slides[index] as any;
  const isIntro = current?.variant === "intro" || current?.id === "intro";

  const withBase = (src?: string) => {
    if (!src) return "";
    return src.startsWith("/")
      ? `${import.meta.env.BASE_URL}${src.slice(1)}`
      : src;
  };

  const setImgFallback = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = `${import.meta.env.BASE_URL}vite.svg`;
  };

  const progress = useMemo(() => {
    if (total <= 1) return 100;
    return Math.round(((index + 1) / total) * 100);
  }, [index, total]);

  const bodyParts = useMemo(() => {
    const body = (current?.body ?? "") as string;
    return body
      .split("\n\n")
      .map((p) => p.trim())
      .filter(Boolean);
  }, [current?.body]);

  const isGalleryStep = current?.type === "galleryStep";
  const galleryImages: GalleryImage[] = current?.images ?? [];
  const galleryHasImages = isGalleryStep && galleryImages.length > 0;

  const mediaToShow: GalleryImage | undefined = galleryHasImages
    ? galleryImages[galleryIndex]
    : current?.images?.[0] ||
      (current?.src
        ? {
            src: current.src,
            alt: current.alt,
            caption: current.caption,
          }
        : undefined);

  const allImagesSeen =
    !galleryHasImages || seenImages.size >= galleryImages.length;

  const canGoNext = preloadReady && allImagesSeen;

  const normalParts = useMemo(() => {
    return bodyParts.filter(
      (part) =>
        !part.startsWith("[BADGE]") &&
        !part.startsWith("[CARD]") &&
        !part.startsWith("[CARD-YELLOW]")
    );
  }, [bodyParts]);

  const specialParts = useMemo(() => {
    return bodyParts.filter(
      (part) =>
        part.startsWith("[BADGE]") ||
        part.startsWith("[CARD]") ||
        part.startsWith("[CARD-YELLOW]")
    );
  }, [bodyParts]);

  function renderParagraphOrList(part: string, key: React.Key) {
    if (part.startsWith("---") && part.endsWith("---")) {
      return (
        <h3 key={key} className="sp-sectionTitle">
          {part.replace(/---/g, "").trim()}
        </h3>
      );
    }

    const lines = splitLines(part);
    const bulletLines = lines.filter(
      (line) => line.startsWith("- ") || line.startsWith("•")
    );
    const normalLines = lines.filter(
      (line) => !line.startsWith("- ") && !line.startsWith("•")
    );

    if (bulletLines.length > 0) {
      return (
        <div key={key} className="sp-paragraphGroup">
          {normalLines.length > 0 && (
            <p className="sp-paragraph">{normalLines.join(" ")}</p>
          )}

          <ul className="sp-list">
            {bulletLines.map((line, idx) => (
              <li key={idx}>{line.replace(/^(- |•\s?)/, "").trim()}</li>
            ))}
          </ul>
        </div>
      );
    }

    return (
      <p key={key} className="sp-paragraph">
        {part}
      </p>
    );
  }

  function renderBodyText(parts: string[]) {
    if (parts.length === 0) return null;

    return <div className="sp-body-text">{parts.map(renderParagraphOrList)}</div>;
  }

  function renderSideCards(parts: string[]) {
    if (parts.length === 0) return null;

    return (
      <div className="sp-sideCards">
        {parts.map((part, i) => {
          if (part.startsWith("[BADGE]")) {
            return (
              <div key={i} className="intro-badge">
                {part.replace("[BADGE]", "").trim()}
              </div>
            );
          }

          if (part.startsWith("[CARD-YELLOW]")) {
            const raw = part.replace("[CARD-YELLOW]", "").trim();
            const lines = splitLines(raw);
            const header = lines[0] ?? "";
            const rest = lines.slice(1);
            const bulletLines = rest.filter(
              (line) => line.startsWith("- ") || line.startsWith("•")
            );
            const normalLines = rest.filter(
              (line) => !line.startsWith("- ") && !line.startsWith("•")
            );

            return (
              <div key={i} className="sp-sideCard yellow">
                {header && (
                  <strong className="intro-card-header">{header}</strong>
                )}

                {normalLines.length > 0 && (
                  <p className="sp-paragraph">{normalLines.join(" ")}</p>
                )}

                {bulletLines.length > 0 && (
                  <ul className="sp-list">
                    {bulletLines.map((line, idx) => (
                      <li key={idx}>{line.replace(/^(- |•\s?)/, "").trim()}</li>
                    ))}
                  </ul>
                )}
              </div>
            );
          }

          if (part.startsWith("[CARD]")) {
            const raw = part.replace("[CARD]", "").trim();
            const lines = splitLines(raw);
            const header = lines[0] ?? "";
            const rest = lines.slice(1);
            const bulletLines = rest.filter(
              (line) => line.startsWith("- ") || line.startsWith("•")
            );
            const normalLines = rest.filter(
              (line) => !line.startsWith("- ") && !line.startsWith("•")
            );

            return (
              <div key={i} className="sp-sideCard">
                {header && (
                  <strong className="intro-card-header">{header}</strong>
                )}

                {normalLines.length > 0 && (
                  <p className="sp-paragraph">{normalLines.join(" ")}</p>
                )}

                {bulletLines.length > 0 && (
                  <ul className="sp-list">
                    {bulletLines.map((line, idx) => (
                      <li key={idx}>{line.replace(/^(- |•\s?)/, "").trim()}</li>
                    ))}
                  </ul>
                )}
              </div>
            );
          }

          return null;
        })}
      </div>
    );
  }

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setPreloadReady(false);

      const currentUrls = (current?.images ?? [])
        .map((img: GalleryImage) => withBase(img.src))
        .filter(Boolean);

      await Promise.all(currentUrls.map(preloadImage));

      if (!cancelled) {
        setPreloadReady(true);
      }
    };

    run();

    setGalleryIndex(0);
    setSeenImages(new Set(galleryHasImages ? [0] : []));

    return () => {
      cancelled = true;
    };
  }, [index, galleryHasImages, current?.images]);

  const handleNextImage = () => {
    if (!galleryHasImages) return;
    if (galleryIndex >= galleryImages.length - 1) return;

    const nextIndex = galleryIndex + 1;
    setGalleryIndex(nextIndex);
    setSeenImages((prev) => new Set([...prev, nextIndex]));
  };

  const handlePrevImage = () => {
    if (!galleryHasImages) return;
    if (galleryIndex <= 0) return;

    const prevIndex = galleryIndex - 1;
    setGalleryIndex(prevIndex);
    setSeenImages((prev) => new Set([...prev, prevIndex]));
  };

  const handleNextSlide = () => {
    if (!canGoNext) return;

    if (index === total - 1) {
      onFinish();
      return;
    }

    setIndex((i) => i + 1);
  };

  const handleBackSlide = () => {
    setIndex((i) => Math.max(0, i - 1));
  };

  return (
    <div className="sp-root">
      <div className="sp-top">
        <div className="sp-progressRow">
          <div className="sp-progressTrack">
            <div
              className="sp-progressFill"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="sp-counter">
            {index + 1} / {total}
          </div>
        </div>
      </div>

      <div className="sp-stage">
        <div className={`sp-card ${isIntro ? "is-intro" : ""}`}>
          <div className="sp-cardContent">
            {current?.title && <h2 className="sp-title">{current.title}</h2>}

            <div className="sp-content-grid sp-content-grid--side">
              <div className="sp-text-column">
                <div className="sp-body-wrapper">
                  {renderBodyText(normalParts)}

                  {current?.bullets && (
                    <ul className="sp-list">
                      {current.bullets.map((b: string, i: number) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>

                {renderSideCards(specialParts)}
              </div>

              <div className="sp-media-column">
                {mediaToShow && (
                  <figure className="sp-media">
                    <div className="sp-mediaFrame">
                      <img
                        src={withBase(mediaToShow.src)}
                        alt={mediaToShow.alt ?? ""}
                        onError={setImgFallback}
                      />
                    </div>

                    <div className="sp-media-info-area">
                      {mediaToShow.caption && (
                        <figcaption className="sp-caption-small">
                          {mediaToShow.caption}
                        </figcaption>
                      )}

                      {mediaToShow.text && (
                        <p className="sp-image-text">{mediaToShow.text}</p>
                      )}
                    </div>
                  </figure>
                )}

                {galleryHasImages && (
                  <div className="sp-galleryControls">
                    <button
                      className="sp-btn ghost"
                      onClick={handlePrevImage}
                      disabled={galleryIndex === 0}
                      type="button"
                    >
                      Föregående bild
                    </button>

                    <div className="sp-galleryStatus">
                      Bild {galleryIndex + 1} / {galleryImages.length}
                      <br />
                    </div>

                    <button
                      className="sp-btn ghost"
                      onClick={handleNextImage}
                      disabled={galleryIndex === galleryImages.length - 1}
                      type="button"
                    >
                      Nästa bild
                    </button>
                  </div>
                )}

                {!allImagesSeen && galleryHasImages && (
                  <div className="sp-alert-text">
                    Visa alla bilder i denna slide för att låsa upp nästa steg.
                  </div>
                )}

                {!preloadReady && (
                  <div className="sp-alert-text">Laddar bilder…</div>
                )}
              </div>
            </div>
          </div>

          <div className="sp-bottom sp-bottomInside">
            <button
              className="sp-btn ghost"
              onClick={handleBackSlide}
              disabled={index === 0}
            >
              Tillbaka
            </button>

            <button
              className="sp-btn primary"
              onClick={handleNextSlide}
              disabled={!canGoNext}
            >
              {index === total - 1 ? "GÅ TILL TEST" : "NÄSTA"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
