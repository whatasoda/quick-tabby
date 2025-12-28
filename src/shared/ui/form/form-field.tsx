import type { JSX } from "solid-js";
import { Show, splitProps } from "solid-js";
import {
  formFieldRecipe,
  labelRecipe,
  descriptionRecipe,
  type FormFieldVariants,
} from "./form.recipe";

export interface FormFieldProps extends FormFieldVariants {
  label: string;
  description?: string;
  children: JSX.Element;
}

export function FormField(props: FormFieldProps) {
  const [local, variants] = splitProps(props, [
    "label",
    "description",
    "children",
  ]);

  return (
    <div class={formFieldRecipe(variants)}>
      <div>
        <div class={labelRecipe()}>{local.label}</div>
        <Show when={local.description}>
          <div class={descriptionRecipe()}>{local.description}</div>
        </Show>
      </div>
      {local.children}
    </div>
  );
}
