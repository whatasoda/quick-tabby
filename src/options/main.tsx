import { render } from "solid-js/web";
import { App } from "./index.tsx";

const root = document.getElementById("app");
if (root) {
  render(() => <App />, root);
}
