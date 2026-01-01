import { onCleanup, onMount } from "solid-js";
import { createPopupConnection } from "../../infrastructure/chrome/messaging.ts";

interface UsePopupPortOptions {
  onClosePopup: (selectFocused: boolean) => void;
}

export function usePopupPort(options: UsePopupPortOptions) {
  const { onClosePopup } = options;

  let connection: ReturnType<typeof createPopupConnection> | undefined;

  function handleMessage(message: unknown) {
    if (
      typeof message === "object" &&
      message !== null &&
      "type" in message &&
      message.type === "CLOSE_POPUP"
    ) {
      const selectFocused =
        "selectFocused" in message && typeof message.selectFocused === "boolean"
          ? message.selectFocused
          : false;
      onClosePopup(selectFocused);
    }
  }

  onMount(() => {
    connection = createPopupConnection();
    connection.onMessage(handleMessage);
  });

  onCleanup(() => {
    connection?.disconnect();
  });
}
