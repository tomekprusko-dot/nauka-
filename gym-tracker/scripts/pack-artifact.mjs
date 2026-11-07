// Skleja zbudowaną appkę w jeden plik HTML do opublikowania w Claude.
// Użycie: npm run build:artifact  ->  powstaje dist-artifact/gym-tracker.html
import { readFileSync, writeFileSync } from "node:fs";

const dir = new URL("../dist-artifact/", import.meta.url);
const js = readFileSync(new URL("app.js", dir), "utf8");
const css = readFileSync(new URL("app.css", dir), "utf8");

// "</script" w środku kodu zamknąłby znacznik <script> za wcześnie.
const safeJs = js.replace(/<\/script/gi, "<\\/script");

const REACT = "https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js";
const REACT_DOM = "https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js";

// Paczka React 18 z CDN nie ma modułu "react/jsx-runtime", którego używa
// skompilowany JSX - podstawiamy mały zamiennik oparty na createElement.
const jsxShim = `window.ReactJSXRuntime = (function () {
  function jsx(type, props, key) {
    return React.createElement(type, key === undefined ? props : Object.assign({}, props, { key: key }));
  }
  return { jsx: jsx, jsxs: jsx, Fragment: React.Fragment };
})();`;

// Claude sam dokłada <!doctype>, <head> i <body> - piszemy tylko zawartość.
const html = `<title>Wyciskanie 120 kg</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="theme-color" content="#16a34a">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Semi+Condensed:wght@600;700;800&display=swap">
<style>
${css}
</style>
<div id="root"></div>
<script src="${REACT}"></script>
<script src="${REACT_DOM}"></script>
<script>
${jsxShim}
</script>
<script>
${safeJs}
</script>
`;

writeFileSync(new URL("gym-tracker.html", dir), html);
console.log(`dist-artifact/gym-tracker.html: ${(html.length / 1024).toFixed(1)} KB`);
