import { onMount, onCleanup } from "solid-js";
import { connectPopup } from "../../infrastructure/chrome/messaging.ts";

interface UsePopupPortOptions {
  onClosePopup: (selectFocused: boolean) => void;
}

export function usePopupPort(options: UsePopupPortOptions) {
  const { onClosePopup } = options;

  let port: chrome.runtime.Port | undefined;

  function handleMessage(message: { type: string; selectFocused?: boolean }) {
    if (message.type === "CLOSE_POPUP") {
      onClosePopup(message.selectFocused ?? false);
    }
  }

  onMount(() => {
    port = connectPopup();
    port.onMessage.addListener(handleMessage);
  });

  onCleanup(() => {
    port?.disconnect();
  });
}
