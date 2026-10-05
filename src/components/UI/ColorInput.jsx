// src/components/UI/ColorInput.jsx

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Shuffle } from "lucide-react";
import { useTheme } from "next-themes";

const hslToHex = (hsl) => {
  const match = hsl.match(/hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/);
  if (!match) return "#FFFFFF";

  let h = parseInt(match[1]);
  let s = parseInt(match[2]) / 100;
  let l = parseInt(match[3]) / 100;

  let c = (1 - Math.abs(2 * l - 1)) * s;
  let x = c * (1 - ((h / 60) % 2 - 1) ** 2);
  let m = l - c / 2;

  let r, g, b;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("").toUpperCase();
};

const generateRandomColor = () => {
  const randomHue = Math.floor(Math.random() * 360);
  const randomSaturation = 50 + Math.floor(Math.random() * 50);
  const randomLightness = 40 + Math.floor(Math.random() * 30);
  const hsl = `hsl(${randomHue}, ${randomSaturation}%, ${randomLightness}%)`;
  return hslToHex(hsl);
};

export const ColorInput = ({ value, onChange, disabled = false }) => {
  const { theme } = useTheme();
  const [localHex, setLocalHex] = useState(
    (value || "FFFFFF").replace("#", ""),
  );
  const [prevValue, setPrevValue] = useState(value);

  if (value !== prevValue) {
    setPrevValue(value);
    setLocalHex((value || "FFFFFF").replace("#", "").toUpperCase());
  }

  const shuffleColor = () => {
    const newHex = generateRandomColor();
    onChange(newHex);
  };

  const handleValidation = () => {
    const cleanValue = localHex.replace(/[^0-9A-Fa-f]/g, "").toUpperCase();

    if (cleanValue.length < 6) {
      const randomHex = generateRandomColor();
      onChange(randomHex);
      setLocalHex(randomHex.replace("#", "").toUpperCase());
    } else {
      const finalHex = `#${cleanValue}`;
      onChange(finalHex);
      setLocalHex(cleanValue);
    }
  };

  return (
    <div
      className={cn(
        "flex items-center bg-[#ECECEF] dark:bg-[#212025] rounded-xl overflow-hidden transition-all duration-200",
        disabled && "opacity-40 pointer-events-none select-none",
      )}
    >
      {/* Left: Color Swatch & Hex Input */}
      <div className="flex items-center flex-1 py-1.5 px-2.5 border-r border-gray-300/60 dark:border-white/10">
        <div
          className="w-5 h-5 rounded-md border border-gray-300/80 dark:border-gray-600/50 shadow-sm shrink-0 mr-2.5"
          style={{ backgroundColor: value || "#FFFFFF" }}
        />

        <input
          type="text"
          disabled={disabled}
          value={localHex}
          maxLength={6}
          onChange={(e) => {
            const sanitized = e.target.value
              .replace(/[^0-9A-Fa-f]/g, "")
              .toUpperCase();
            setLocalHex(sanitized);
            if (sanitized.length === 6) {
              onChange(`#${sanitized}`);
            }
          }}
          onBlur={handleValidation}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleValidation();
              e.currentTarget.blur();
            }
          }}
          className="w-full bg-transparent text-[#111113] dark:text-gray-200 font-medium text-[12px] tracking-wide focus:outline-none uppercase"
        />
      </div>

      {/* Right: Shuffle Button & % */}
      <div className="flex items-center gap-2 px-3.5 py-1.5">
        <button
          onClick={shuffleColor}
          disabled={disabled}
          className="p-1.5 hover:bg-gray-300 dark:hover:bg-[#3F3F46] rounded-full transition-colors"
        >
          <Shuffle
            size={12}
            style={{
              color: theme === "dark" ? "#ffffff" : "#111113",
            }}
          />
        </button>
      </div>
    </div>
  );
};