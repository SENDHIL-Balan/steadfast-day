import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { getRouter } from "./router";
import "./styles.css";

// Client-side entry point. The TanStack Start SSR pipeline uses src/server.ts
// and src/routes/__root.tsx; this file mounts the very same router into
// index.html for a plain client-rendered (SPA) start.
const router = getRouter();

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error('Missing <div id="root"></div> in index.html');
}

createRoot(rootElement).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
