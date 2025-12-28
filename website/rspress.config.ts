import { defineConfig } from "rspress/config";

export default defineConfig({
  root: "docs",
  title: "QuickTabby",
  description: "Fast tab switching with MRU tracking",
  lang: "en",
  icon: "/logo.svg",
  logo: {
    light: "/logo.svg",
    dark: "/logo.svg",
  },
  locales: [
    {
      lang: "en",
      label: "English",
      title: "QuickTabby",
      description: "Fast tab switching with MRU tracking",
    },
    {
      lang: "ja",
      label: "Japanese",
      title: "QuickTabby",
      description: "MRU（最近使用した順）でタブを素早く切り替える Chrome 拡張機能",
    },
  ],
  themeConfig: {
    socialLinks: [
      {
        icon: "github",
        mode: "link",
        content: "https://github.com/whatasoda/quick-tabby",
      },
    ],
    locales: [
      {
        lang: "en",
        label: "English",
        outlineTitle: "On this page",
        prevPageText: "Previous",
        nextPageText: "Next",
      },
      {
        lang: "ja",
        label: "日本語",
        outlineTitle: "目次",
        prevPageText: "前へ",
        nextPageText: "次へ",
      },
    ],
  },
});
