import { useAnimationStore } from "@/store/animationStore";

const templates = [
  { id: 1, name: "Bounce", preview: "/templates/bounce.gif" },
  { id: 2, name: "Fade In", preview: "/templates/fadeIn.gif" },
  { id: 3, name: "Slide", preview: "/templates/slide.gif" },
];

export default function TemplateSelector() {
  const setSelectedTemplate = useAnimationStore(
    (state) => state.setSelectedTemplate,
  );

  return (
    <div className="sidebar">
      <h2>Templates</h2>
      <div className="grid">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => setSelectedTemplate(template)}
            className="template-item"
          >
            <img src={template.preview} alt={template.name} />
            <p>{template.name}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
