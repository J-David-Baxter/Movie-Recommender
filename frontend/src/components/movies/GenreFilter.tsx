import { useEffect, useState } from "react";
import { api } from "../../api/client";

interface Props {
  selected: string[];
  onChange: (genres: string[]) => void;
}

export function GenreFilter({ selected, onChange }: Props) {
  const [genres, setGenres] = useState<string[]>([]);

  useEffect(() => {
    api.getGenres().then(setGenres).catch(console.error);
  }, []);

  function toggle(g: string) {
    if (selected.includes(g)) {
      onChange(selected.filter((x) => x !== g));
    } else {
      onChange([...selected, g]);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {genres.map((g) => (
        <button
          key={g}
          onClick={() => toggle(g)}
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
            selected.includes(g)
              ? "bg-purple-600 border-purple-500 text-white"
              : "bg-gray-800 border-gray-600 text-gray-300 hover:border-gray-400"
          }`}
        >
          {g}
        </button>
      ))}
    </div>
  );
}
