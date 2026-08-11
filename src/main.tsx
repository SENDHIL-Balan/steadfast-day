/**
 * Standalone client entry — used only by the static SPA build (`npm run build:spa`)
 * that gets packaged into the Android APK / WebView shell.
 *
 * The normal web deployment still uses TanStack Start's SSR entry
 * (src/server.ts + src/routes/__root.tsx); this file is not part of it.
 *
 * Hash history is mandatory here: inside a WebView the app is served from
 * file:// (or a capacitor:// origin) where path navigations like /tomorrow have
 * no server to resolve them, so tapping the tab bar would appear to freeze.
 */
import { createHashHistory, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { getRouter } from "./router";
import "./styles.css";

const router = getRouter(createHashHistory());

const container = document.getElementById("root");
if (!container) throw new Error('Missing #root element in index.html');

createRoot(container).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
