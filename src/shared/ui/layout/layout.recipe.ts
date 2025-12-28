import { cva, type RecipeVariantProps } from "../../../../styled-system/css";

export const sectionRecipe = cva({
  base: {
    background: "background",
    borderRadius: "xl",
    padding: "lg",
    marginBottom: "lg",
    boxShadow: "sm",
  },
});

export const sectionTitleRecipe = cva({
  base: {
    fontSize: "lg",
    fontWeight: 600,
    color: "text.secondary",
    margin: "0 0 12px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
});

export type SectionVariants = RecipeVariantProps<typeof sectionRecipe>;
