import React from "react";
import { createRoot } from "react-dom/client";
import "./style.css";
import App from "./App";

const container = document.getElementById("app");
if (!container) {
  throw new Error("Root element with id 'app' not found in index.html");
}

createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
