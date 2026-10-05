import { useAnimationStore } from "@/store/animationStore";
import { useEffect, useRef } from "react";

export default function Canvas() {
  const canvasRef = useRef(null);
  const {
    selectedTemplate,
    backgroundColor,
    animationColor,
    textContent,
    duration,
  } = useAnimationStore();

  useEffect(() => {
    if (!canvasRef.current || !selectedTemplate) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Draw background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw animation (placeholder)
    ctx.fillStyle = animationColor;
    ctx.fillRect(50, 50, 100, 100);

    // Draw text
    ctx.fillStyle = "#000000";
    ctx.font = "24px Arial";
    ctx.fillText(textContent, 50, 200);
  }, [
    selectedTemplate,
    backgroundColor,
    animationColor,
    textContent,
    duration,
  ]);

  return (
    <canvas
      ref={canvasRef}
      width={640}
      height={360}
      className="border border-gray-300"
    />
  );
}
