import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import spaceGroteskLatinWoff2 from "@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2?url";
import ibmPlexSansLatin400Woff2 from "@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-400-normal.woff2?url";
import "@fontsource-variable/space-grotesk/index.css";
import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/500.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "./index.css";
import App from "./App.tsx";

// Preload the two fonts the very first paint depends on (hero headline +
// body text) so the browser starts fetching them instead of waiting for
// the CSS to finish downloading and expose the @font-face src.
for (const href of [spaceGroteskLatinWoff2, ibmPlexSansLatin400Woff2]) {
  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "font";
  link.type = "font/woff2";
  link.href = href;
  link.crossOrigin = "anonymous";
  document.head.appendChild(link);
}

// Restore persisted theme + accent before first paint to avoid flashes.
const storedTheme = localStorage.getItem("theme");
const dark =
  storedTheme === "dark" ||
  (!storedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches);
document.documentElement.classList.toggle("dark", dark);

const storedAccent = localStorage.getItem("accent");
if (storedAccent) {
  document.documentElement.style.setProperty("--accent", storedAccent);
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
