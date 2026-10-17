import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MotionConfig } from "framer-motion";
import App from "./App.jsx";
import "./index.css";
import "./apps.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* reducedMotion="user" — transform springs are skipped for users who
        prefer reduced motion (opacity fades remain), matching the CSS
        prefers-reduced-motion block in index.css. */}
    <MotionConfig reducedMotion="user">
      <App />
    </MotionConfig>
  </StrictMode>
);
