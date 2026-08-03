import React from "react";
import { createRoot } from "react-dom/client";
import "./storage.js";          // window.storage 를 먼저 준비합니다
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(<App />);
