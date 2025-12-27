import { render } from "solid-js/web";
import { createSignal, Show } from "solid-js";
import "./index.css";
import { setupChromeMock } from "./mocks/chrome-api.ts";

// Setup Chrome API mock before any component imports
setupChromeMock();

type PreviewType = "popup" | "options";

function DevApp() {
  const [activePreview, setActivePreview] = createSignal<PreviewType>("popup");

  return (
    <div class="dev-container">
      <nav class="dev-nav">
        <h1>QuickTabby Dev Preview</h1>
        <div class="preview-tabs">
          <button
            class={activePreview() === "popup" ? "active" : ""}
            onClick={() => setActivePreview("popup")}
          >
            Popup
          </button>
          <button
            class={activePreview() === "options" ? "active" : ""}
            onClick={() => setActivePreview("options")}
          >
            Options
          </button>
        </div>
      </nav>

      <main class="preview-area">
        <Show when={activePreview() === "popup"}>
          <div>Popup Preview (Component will be added)</div>
        </Show>
        <Show when={activePreview() === "options"}>
          <div>Options Preview (Component will be added)</div>
        </Show>
      </main>
    </div>
  );
}

const root = document.getElementById("app");
if (root) {
  render(() => <DevApp />, root);
}
