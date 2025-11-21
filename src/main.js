import { jsx as _jsx } from "react/jsx-runtime";
import "./global.css";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";
ReactDOM.createRoot(document.getElementById("root")).render(_jsx(React.StrictMode, { children: _jsx(App, {}) }));
import { registerSW } from "virtual:pwa-register";
registerSW({
    immediate: true,
});
