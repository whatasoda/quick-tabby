import { render } from "solid-js/web";
import { createSignal, createResource, For } from "solid-js";

interface ShortcutInfo {
  name: string;
  description: string;
  shortcut: string;
}

async function getShortcuts(): Promise<ShortcutInfo[]> {
  const commands = await chrome.commands.getAll();
  return commands.map((cmd) => ({
    name: cmd.name ?? "",
    description: cmd.description ?? "",
    shortcut: cmd.shortcut ?? "Not set",
  }));
}

function App() {
  const [shortcuts] = createResource(getShortcuts);

  function openShortcutsPage() {
    chrome.tabs.create({ url: "chrome://extensions/shortcuts" });
  }

  return (
    <div class="container">
      <h1>QuickTabby Settings</h1>

      <div class="section">
        <h2 class="section-title">Keyboard Shortcuts</h2>
        <div class="shortcut-list">
          <For each={shortcuts()}>
            {(shortcut) => (
              <div class="shortcut-item">
                <span class="shortcut-name">{shortcut.description}</span>
                <span class="shortcut-key">{shortcut.shortcut}</span>
              </div>
            )}
          </For>
        </div>
        <button class="link-button" onClick={openShortcutsPage}>
          Change Shortcuts
        </button>
        <p class="note">
          Opens Chrome's extension shortcuts page where you can customize
          keyboard shortcuts.
        </p>
      </div>
    </div>
  );
}

const root = document.getElementById("app");
if (root) {
  render(() => <App />, root);
}
