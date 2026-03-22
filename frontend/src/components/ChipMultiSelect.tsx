type ChipMultiSelectProps = {
  label: string;
  hint?: string;
  options: readonly string[];
  selected: string[];
  onChange: (next: string[]) => void;
};

export function ChipMultiSelect({
  label,
  hint,
  options,
  selected,
  onChange,
}: ChipMultiSelectProps) {
  function toggle(item: string) {
    if (selected.includes(item)) {
      onChange(selected.filter((x) => x !== item));
    } else {
      onChange([...selected, item]);
    }
  }

  return (
    <fieldset className="field-group">
      <legend className="field-label">{label}</legend>
      {hint ? <p className="field-hint">{hint}</p> : null}
      <div className="chip-grid">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            className={`chip ${selected.includes(opt) ? "chip--on" : ""}`}
            onClick={() => toggle(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
