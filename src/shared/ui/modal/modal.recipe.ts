import { cva, type RecipeVariantProps } from "../../../../styled-system/css";

export const overlayRecipe = cva({
  base: {
    position: "fixed",
    inset: 0,
    background: "overlay",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
});

export const modalContentRecipe = cva({
  base: {
    background: "background",
    borderRadius: "lg",
    padding: "lg",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
  },
  variants: {
    size: {
      sm: {
        minWidth: "200px",
        maxWidth: "280px",
      },
      md: {
        minWidth: "300px",
        maxWidth: "400px",
      },
      lg: {
        minWidth: "400px",
        maxWidth: "600px",
      },
    },
  },
  defaultVariants: {
    size: "sm",
  },
});

export type ModalContentVariants = RecipeVariantProps<typeof modalContentRecipe>;
