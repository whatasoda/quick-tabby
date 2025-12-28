import type { JSX } from "solid-js";
import { splitProps } from "solid-js";
import { buttonRecipe, type ButtonVariants } from "./button.recipe";

export type ButtonProps = ButtonVariants & {
  children: JSX.Element;
  onClick?: () => void;
  title?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  class?: string;
};

export function Button(props: ButtonProps) {
  const [local, variants, rest] = splitProps(
    props,
    ["children", "onClick", "title", "disabled", "type", "class"],
    ["variant", "size"],
  );

  return (
    <button
      class={`${buttonRecipe(variants)}${local.class ? ` ${local.class}` : ""}`}
      onClick={local.onClick}
      title={local.title}
      disabled={local.disabled}
      type={local.type ?? "button"}
      {...rest}
    >
      {local.children}
    </button>
  );
}
