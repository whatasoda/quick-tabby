import { createSignal, Show } from "solid-js";
import { render } from "solid-js/web";
import "./index.css";
import { setupChromeMock } from "./mocks/chrome-api.ts";
import { OptionsPreview } from "./previews/OptionsPreview.tsx";
import { PopupPreview } from "./previews/PopupPreview.tsx";

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
            type="button"
            class={activePreview() === "popup" ? "active" : ""}
            onClick={() => setActivePreview("popup")}
          >
            Popup
          </button>
          <button
            type="button"
            class={activePreview() === "options" ? "active" : ""}
            onClick={() => setActivePreview("options")}
          >
            Options
          </button>
        </div>
      </nav>

      <main class="preview-area">
        <Show when={activePreview() === "popup"}>
          <PopupPreview />
        </Show>
        <Show when={activePreview() === "options"}>
          <OptionsPreview />
        </Show>
      </main>
    </div>
  );
}

const root = document.getElementById("app");
if (root) {
  render(() => <DevApp />, root);
}
