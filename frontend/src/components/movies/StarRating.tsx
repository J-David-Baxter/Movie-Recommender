import { useState } from "react";

interface Props {
  value: number | null;
  onChange: (rating: number) => void;
  disabled?: boolean;
}

const STEPS = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

export function StarRating({ value, onChange, disabled }: Props) {
  const [hovered, setHovered] = useState<number | null>(null);

  const display = hovered ?? value ?? 0;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const full = display >= star;
        const half = !full && display >= star - 0.5;
        return (
          <div
            key={star}
            className="relative cursor-pointer select-none"
            style={{ width: 28, height: 28, fontSize: 24, lineHeight: "28px" }}
          >
            {/* left half hit area */}
            <div
              className="absolute inset-y-0 left-0 w-1/2 z-10"
              onMouseEnter={() => setHovered(star - 0.5)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => !disabled && onChange(star - 0.5)}
            />
            {/* right half hit area */}
            <div
              className="absolute inset-y-0 right-0 w-1/2 z-10"
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => !disabled && onChange(star)}
            />
            <span className={full ? "text-yellow-400" : half ? "text-yellow-300" : "text-gray-600"}>
              ★
            </span>
          </div>
        );
      })}
      {value != null && (
        <span className="text-sm text-gray-400 ml-1">{value.toFixed(1)}</span>
      )}
    </div>
  );
}
