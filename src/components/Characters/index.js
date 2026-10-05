export { CoveyCharacter } from "./Covey/CoveyCharacter";
export * from "./Covey/index";

// Character metadata untuk library
export const CHARACTER_LIBRARY = [
  {
    id: "covey",
    name: "Covey",
    component: "CoveyCharacter",
    description: "Cute round mascot with big personality",
    thumbnail: "🟤", // emoji or image
    moods: [
      "idle",
      "working",
      "thinking",
      "searching",
      "approval",
      "question",
      "error",
      "ratelimit",
      "sleeping",
      "dizzy",
      "finished",
      "uploading",
      "dancing",
      "loveStruck",
    ],
    customizable: {
      color: true,
      backgroundColor: false,
      textColor: true,
    },
  },
  // Add more characters here later
];
