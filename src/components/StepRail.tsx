"use client";

type Step = "apple" | "dropbox" | "folder" | "transfer";

const LABELS: { id: Step; label: string }[] = [
  { id: "apple", label: "Apple" },
  { id: "dropbox", label: "Dropbox" },
  { id: "folder", label: "Folder" },
  { id: "transfer", label: "Transfer" },
];

export function StepRail({ current }: { current: Step }) {
  const index = LABELS.findIndex((s) => s.id === current);

  return (
    <nav className="step-rail" aria-label="Setup progress">
      {LABELS.map((step, i) => {
        const state = i < index ? "done" : i === index ? "current" : "todo";
        return (
          <div key={step.id} className={`step-rail__item step-rail__item--${state}`}>
            <span className="step-rail__dot" />
            <span className="step-rail__label">{step.label}</span>
          </div>
        );
      })}
    </nav>
  );
}
