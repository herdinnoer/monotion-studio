import { useAnimationStore } from "@/store/animationStore";

export default function PropertiesPanel() {
  const {
    backgroundColor,
    setBackgroundColor,
    animationColor,
    setAnimationColor,
    textContent,
    setTextContent,
    duration,
    setDuration,
  } = useAnimationStore();

  return (
    <div className="properties-panel">
      <h3>Properties</h3>

      {/* Background Color */}
      <div>
        <label>Background Color</label>
        <input
          type="color"
          value={backgroundColor}
          onChange={(e) => setBackgroundColor(e.target.value)}
        />
      </div>

      {/* Animation Color */}
      <div>
        <label>Animation Color</label>
        <input
          type="color"
          value={animationColor}
          onChange={(e) => setAnimationColor(e.target.value)}
        />
      </div>

      {/* Text Input */}
      <div>
        <label>Text</label>
        <input
          type="text"
          value={textContent}
          onChange={(e) => setTextContent(e.target.value)}
          placeholder="Enter text..."
        />
      </div>

      {/* Duration */}
      <div>
        <label>Duration (seconds)</label>
        <select
          value={duration}
          onChange={(e) => setDuration(parseInt(e.target.value))}
        >
          <option>5</option>
          <option>10</option>
          <option>15</option>
          <option>20</option>
          <option>30</option>
        </select>
      </div>
    </div>
  );
}
