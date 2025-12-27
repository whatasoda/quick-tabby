import { render } from "solid-js/web";

function App() {
  return <div>QuickTabby</div>;
}

const root = document.getElementById("app");
if (root) {
  render(() => <App />, root);
}
