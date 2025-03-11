import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";

console.log("🚀 React startuje!");
window.onload = () => console.log("✅ Strona załadowana!");

console.log("🚀 React uruchamia się!");
console.log("📌 Sprawdzam root:", document.getElementById("root"));

console.log("🚀 React się uruchamia!");
console.log("📌 Sprawdzam root:", document.getElementById("root"));

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
