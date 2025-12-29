import { createEffect, createMemo, type JSX, onCleanup, type Resource, Show } from "solid-js";
import { css } from "../../../styled-system/css";
import type { Settings } from "../../core/settings/settings-types";
import { t } from "../../shared/i18n/index.ts";
import { MSG } from "../../shared/i18n/message-keys.ts";
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
    <Show when={props.settings()} fallback={<div class={styles.loading}>{t(MSG.COMMON_LOADING)}</div>}>
      <div class={styles.container}>{props.children}</div>
    </Show>
  );
}
