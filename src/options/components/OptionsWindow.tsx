import {
  createEffect,
  createMemo,
  onCleanup,
  Show,
  type JSX,
  type Resource,
} from "solid-js";
import { css } from "../../../styled-system/css";
import type { Settings } from "../../core/settings/settings-types";
import { createThemeControl } from "../../shared/theme";

const styles = {
  container: css({
    maxWidth: "600px",
    margin: "0 auto",
  }),
  loading: css({
    padding: "xl",
    textAlign: "center",
    color: "text.secondary",
  }),
};

interface OptionsWindowProps {
  settings: Resource<Settings | undefined>;
  children: JSX.Element;
}

export function OptionsWindow(props: OptionsWindowProps) {
  const themeControl = createMemo(createThemeControl);

  createEffect(() => {
    const settings = props.settings();
    if (settings) {
      themeControl().applyTheme(settings.themePreference);
    }
  });

  onCleanup(() => {
    themeControl().cleanup();
  });

  return (
    <Show
      when={props.settings()}
      fallback={<div class={styles.loading}>Loading...</div>}
    >
      <div class={styles.container}>{props.children}</div>
    </Show>
  );
}
