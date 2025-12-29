import { defineConfig } from "rspress/config";

export default defineConfig({
  root: "docs",
  title: "QuickTabby",
  description: "Fast tab switching sorted by recently used",
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
      description: "Fast tab switching sorted by recently used",
    },
    {
      lang: "ja",
      label: "Japanese",
      title: "QuickTabby",
      description: "最近使った順でタブを素早く切り替える Chrome 拡張機能",
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
    footer: {
      message:
        '<a href="/en/privacy">Privacy</a> | <a href="/en/terms">Terms</a> | <a href="/ja/privacy">プライバシー</a> | <a href="/ja/terms">利用規約</a>',
    },
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
