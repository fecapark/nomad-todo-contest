import App from "./App.js";
import { applyAllFonts } from "./utils/Fonts.js";

window.onload = () => {
  applyAllFonts();
  new App(document.getElementById("app"));
};
