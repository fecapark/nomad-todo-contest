function ApplyFW() {
  const head = document.querySelector("head");

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://use.fontawesome.com/releases/v5.15.2/css/all.css";
  link.integrity =
    "sha384-vSIIfh2YWi9wW0r9iZe7RJPrKwp6bG+s9QZMoITbCckVJqGCCRhc+ccxNcdpHuYu";
  link.crossOrigin = "anonymous";

  head.appendChild(link);
}

function applyAllFonts() {
  ApplyFW();
}

export { applyAllFonts };
