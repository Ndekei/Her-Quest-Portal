"use client";

import { Sheet } from "./Sheet";
import { TEXT_SIZES, usePrefs, type Prefs, type Theme } from "@/lib/storage";

const THEMES: { id: Theme; label: string }[] = [
  { id: "auto", label: "Auto" },
  { id: "light", label: "Light" },
  { id: "sepia", label: "Sepia" },
  { id: "dark", label: "Dark" },
];

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { id: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div>
      <p className="setting-label" id={`set-${label}`}>
        {label}
      </p>
      <div className="segmented full" role="group" aria-labelledby={`set-${label}`}>
        {options.map((option) => (
          <button key={option.id} type="button" aria-pressed={value === option.id} onClick={() => onChange(option.id)}>
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function AppearanceSheet({ onClose, reader = true }: { onClose: () => void; reader?: boolean }) {
  const [prefs, update] = usePrefs();
  const set = <K extends keyof Prefs>(key: K) => (value: Prefs[K]) => update({ [key]: value } as Partial<Prefs>);

  return (
    <Sheet title="Appearance" kind="popover" onClose={onClose}>
      <div className="settings">
        {reader && (
          <div>
            <p className="setting-label">
              Text size · <span style={{ fontVariantNumeric: "tabular-nums" }}>{TEXT_SIZES[prefs.size]} pt</span>
            </p>
            <div className="stepper">
              <button type="button" aria-label="Smaller text" disabled={prefs.size <= 0} onClick={() => update({ size: prefs.size - 1 })}>
                <span className="small">A</span>
              </button>
              <i aria-hidden />
              <button
                type="button"
                aria-label="Larger text"
                disabled={prefs.size >= TEXT_SIZES.length - 1}
                onClick={() => update({ size: prefs.size + 1 })}
              >
                <span className="big">A</span>
              </button>
            </div>
          </div>
        )}

        <div>
          <p className="setting-label" id="set-theme">
            Theme
          </p>
          <div className="swatches" role="group" aria-labelledby="set-theme">
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                type="button"
                className="swatch"
                aria-pressed={prefs.theme === theme.id}
                onClick={() => update({ theme: theme.id })}
              >
                <span className={`swatch-${theme.id}`}>Aa</span>
                {theme.label}
              </button>
            ))}
          </div>
        </div>

        {reader && (
          <>
            <Segmented
              label="Font"
              value={prefs.font}
              onChange={set("font")}
              options={[
                { id: "serif", label: "New York" },
                { id: "sans", label: "San Francisco" },
              ]}
            />
            <Segmented
              label="Line spacing"
              value={prefs.leading}
              onChange={set("leading")}
              options={[
                { id: "compact", label: "Compact" },
                { id: "normal", label: "Normal" },
                { id: "relaxed", label: "Relaxed" },
              ]}
            />
            <Segmented
              label="Page width"
              value={prefs.width}
              onChange={set("width")}
              options={[
                { id: "narrow", label: "Comfortable" },
                { id: "wide", label: "Wide" },
              ]}
            />
          </>
        )}
      </div>
    </Sheet>
  );
}
