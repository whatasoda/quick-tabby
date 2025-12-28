import type { JSX } from "solid-js";
import { Show } from "solid-js";
import { sectionRecipe, sectionTitleRecipe } from "./layout.recipe";

export interface SectionProps {
  title?: string;
  children: JSX.Element;
  class?: string;
}

export function Section(props: SectionProps) {
  return (
    <div class={`${sectionRecipe()}${props.class ? ` ${props.class}` : ""}`}>
      <Show when={props.title}>
        <h2 class={sectionTitleRecipe()}>{props.title}</h2>
      </Show>
      {props.children}
    </div>
  );
}
