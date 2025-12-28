import type { JSX } from "solid-js";
import { checkboxLabelRecipe } from "./form.recipe";

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children?: JSX.Element;
}

export function Checkbox(props: CheckboxProps) {
  return (
    <label class={checkboxLabelRecipe()}>
      <input
        type="checkbox"
        checked={props.checked}
        onChange={(e) => props.onChange(e.target.checked)}
      />
      {props.children}
    </label>
  );
}
