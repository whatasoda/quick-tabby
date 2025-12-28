import { For, splitProps } from "solid-js";
import {
  radioGroupRecipe,
  radioOptionRecipe,
  type RadioGroupVariants,
} from "./form.recipe";

export interface RadioOption<T extends string> {
  value: T;
  label: string;
}

export interface RadioGroupProps<T extends string> extends RadioGroupVariants {
  name: string;
  options: RadioOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function RadioGroup<T extends string>(props: RadioGroupProps<T>) {
  const [local, variants] = splitProps(props, [
    "name",
    "options",
    "value",
    "onChange",
  ]);

  return (
    <div class={radioGroupRecipe(variants)}>
      <For each={local.options}>
        {(option) => (
          <label class={radioOptionRecipe()}>
            <input
              type="radio"
              name={local.name}
              checked={local.value === option.value}
              onChange={() => local.onChange(option.value)}
            />
            {option.label}
          </label>
        )}
      </For>
    </div>
  );
}
