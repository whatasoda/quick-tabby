import { onCleanup, onMount, splitProps, type JSX } from "solid-js";
import {
  overlayRecipe,
  modalContentRecipe,
  type ModalContentVariants,
} from "./modal.recipe";

export type ModalProps = ModalContentVariants & {
  onClose: () => void;
  children: JSX.Element;
  closeOnEscape?: boolean;
  closeOnOverlayClick?: boolean;
};

export function Modal(props: ModalProps) {
  const [local, variants] = splitProps(props, [
    "onClose",
    "children",
    "closeOnEscape",
    "closeOnOverlayClick",
  ]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (local.closeOnEscape !== false && e.key === "Escape") {
      local.onClose();
    }
  };

  const handleOverlayClick = (e: MouseEvent) => {
    if (local.closeOnOverlayClick !== false && e.target === e.currentTarget) {
      local.onClose();
    }
  };

  onMount(() => {
    document.addEventListener("keydown", handleKeyDown);
  });

  onCleanup(() => {
    document.removeEventListener("keydown", handleKeyDown);
  });

  return (
    <div class={overlayRecipe()} onClick={handleOverlayClick}>
      <div class={modalContentRecipe(variants)}>{local.children}</div>
    </div>
  );
}
