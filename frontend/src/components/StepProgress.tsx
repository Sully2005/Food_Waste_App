type StepProgressProps = {
  current: number;
  total: number;
};

export function StepProgress({ current, total }: StepProgressProps) {
  const pct = ((current + 1) / total) * 100;
  return (
    <div className="step-progress" aria-hidden="true">
      <div className="step-progress__track">
        <div
          className="step-progress__fill"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="step-progress__text">
        Step {current + 1} of {total}
      </p>
    </div>
  );
}
