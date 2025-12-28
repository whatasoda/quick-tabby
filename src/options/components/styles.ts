/**
 * Shared styles for options page components
 */

import { css } from "../../../styled-system/css";

/**
 * Section container styles
 */
export const sectionStyles = {
  section: css({
    background: "background",
    borderRadius: "xl",
    padding: "lg",
    marginBottom: "lg",
    boxShadow: "sm",
  }),
  sectionTitle: css({
    fontSize: "lg",
    fontWeight: 600,
    color: "text.secondary",
    margin: "0 0 12px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  }),
};

/**
 * Form element styles
 */
export const formStyles = {
  settingRow: css({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 0",
    borderBottom: "1px solid token(colors.borderLighter)",
    _last: {
      borderBottom: "none",
    },
  }),
  settingRowSubSetting: css({
    paddingLeft: "xl",
    background: "surfaceAlt",
  }),
  settingLabel: css({
    fontSize: "lg",
  }),
  settingDescription: css({
    fontSize: "12px",
    color: "text.secondary",
    marginTop: "xs",
  }),
  radioGroup: css({
    display: "flex",
    gap: "sm",
  }),
  radioOption: css({
    display: "flex",
    alignItems: "center",
    gap: "xs",
    cursor: "pointer",
  }),
  checkboxLabel: css({
    display: "flex",
    alignItems: "center",
    gap: "sm",
    cursor: "pointer",
    "& input": {
      width: "16px",
      height: "16px",
      cursor: "pointer",
    },
  }),
};
