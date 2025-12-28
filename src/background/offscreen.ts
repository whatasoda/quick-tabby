/**
 * Offscreen document for detecting system color scheme changes.
 *
 * Service workers don't have access to matchMedia, so we use an offscreen
 * document to detect color scheme changes and notify the background script.
 */

const darkQuery = matchMedia("(prefers-color-scheme: dark)");

function sendColorScheme(isDark: boolean) {
  chrome.runtime.sendMessage({ type: "COLOR_SCHEME_CHANGED", isDark });
}

// Send initial state
sendColorScheme(darkQuery.matches);

// Listen for changes
darkQuery.addEventListener("change", (e) => {
  sendColorScheme(e.matches);
});
