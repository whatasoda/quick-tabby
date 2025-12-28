import { cva, type RecipeVariantProps } from "../../../../styled-system/css";

export const buttonRecipe = cva({
  base: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    cursor: "pointer",
    transition: "all 0.15s",
    fontFamily: "inherit",
  },
  variants: {
    variant: {
      primary: {
        background: "primary",
        color: "white",
        _hover: {
          background: "primaryHover",
        },
      },
      ghost: {
        background: "transparent",
        color: "text.secondary",
        _hover: {
          background: "surfaceHover",
          color: "text.primary",
        },
      },
      outline: {
        background: "transparent",
        border: "1px dashed token(colors.border)",
        color: "text.secondary",
        _hover: {
          background: "surfaceHover",
          borderStyle: "solid",
        },
      },
      link: {
        background: "none",
        color: "primary",
        padding: "0",
        _hover: {
          textDecoration: "underline",
        },
      },
    },
    size: {
      sm: {
        padding: "4px 8px",
        fontSize: "xs",
        borderRadius: "sm",
      },
      md: {
        padding: "8px 12px",
        fontSize: "sm",
        borderRadius: "md",
      },
      lg: {
        padding: "12px 16px",
        fontSize: "lg",
        borderRadius: "md",
      },
      icon: {
        width: "32px",
        height: "32px",
        padding: "8px",
        borderRadius: "md",
      },
      iconSm: {
        width: "14px",
        height: "14px",
        padding: "0",
        borderRadius: "full",
      },
    },
  },
  defaultVariants: {
    variant: "ghost",
    size: "md",
  },
});

export type ButtonVariants = RecipeVariantProps<typeof buttonRecipe>;
