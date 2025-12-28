import { cva, type RecipeVariantProps } from "../../../../styled-system/css";

export const formFieldRecipe = cva({
  base: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 0",
    borderBottom: "1px solid token(colors.borderLighter)",
    _last: {
      borderBottom: "none",
    },
  },
  variants: {
    indent: {
      none: {},
      sub: {
        paddingLeft: "xl",
        background: "surfaceAlt",
      },
    },
  },
  defaultVariants: {
    indent: "none",
  },
});

export const labelRecipe = cva({
  base: {
    fontSize: "lg",
    color: "text.primary",
  },
});

export const descriptionRecipe = cva({
  base: {
    fontSize: "12px",
    color: "text.secondary",
    marginTop: "xs",
  },
});

export const checkboxLabelRecipe = cva({
  base: {
    display: "flex",
    alignItems: "center",
    gap: "sm",
    cursor: "pointer",
    "& input": {
      width: "16px",
      height: "16px",
      cursor: "pointer",
    },
  },
});

export const radioGroupRecipe = cva({
  base: {
    display: "flex",
    gap: "sm",
  },
  variants: {
    direction: {
      horizontal: {
        flexDirection: "row",
      },
      vertical: {
        flexDirection: "column",
      },
    },
  },
  defaultVariants: {
    direction: "horizontal",
  },
});

export const radioOptionRecipe = cva({
  base: {
    display: "flex",
    alignItems: "center",
    gap: "xs",
    cursor: "pointer",
  },
});

export type FormFieldVariants = RecipeVariantProps<typeof formFieldRecipe>;
export type RadioGroupVariants = RecipeVariantProps<typeof radioGroupRecipe>;
