// Inlines src/ into one self-contained slice.html.  Usage: node build.mjs
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const src = (f) => join(root, "src", f);
const read = (f) => {
  if (!existsSync(src(f))) { console.warn("  missing: src/" + f + " (skipped)"); return ""; }
  return readFileSync(src(f), "utf8");
};

const css = ["tokens.css", "layout.css", "ui.css", "intro.css", "cutscene.css"].map((f) => `/* ---- ${f} ---- */\n` + read(f)).join("\n");
const js = ["icons.js", "ui-art.js", "scene.js", "interlude.js", "intro.js", "epilogue.js", "content.js", "engine.js"]
  .map((f) => `/* ---- ${f} ---- */\n;(function(){\n${read(f)}\n})();`).join("\n");

// A literal "</script" inside the JS would close the tag early
const safeJs = js.replace(/<\/script/gi, "<\\/script");
const html = read("shell.html").replace("<!-- @css -->", () => css).replace("<!-- @js -->", () => safeJs);
writeFileSync(join(root, "slice.html"), html);
writeFileSync(join(root, "..", "index.html"), html);   // the deliverable
console.log("slice.html + ../index.html", (Buffer.byteLength(html) / 1024).toFixed(1) + " KB");
