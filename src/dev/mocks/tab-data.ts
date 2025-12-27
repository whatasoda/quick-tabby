import type { TabInfo } from "../../shared/types.ts";

export const mockTabs: TabInfo[] = [
  {
    id: 1,
    windowId: 1,
    title: "Google - Search Engine",
    url: "https://www.google.com/",
    favIconUrl: "https://www.google.com/favicon.ico",
    thumbnailUrl:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150'%3E%3Crect fill='%234285f4' width='200' height='150'/%3E%3Ctext x='50%25' y='50%25' fill='white' text-anchor='middle' dy='.3em' font-family='sans-serif'%3EGoogle%3C/text%3E%3C/svg%3E",
  },
  {
    id: 2,
    windowId: 1,
    title: "GitHub - Where the world builds software",
    url: "https://github.com/",
    favIconUrl: "https://github.githubassets.com/favicons/favicon.svg",
    thumbnailUrl:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150'%3E%3Crect fill='%2324292e' width='200' height='150'/%3E%3Ctext x='50%25' y='50%25' fill='white' text-anchor='middle' dy='.3em' font-family='sans-serif'%3EGitHub%3C/text%3E%3C/svg%3E",
  },
  {
    id: 3,
    windowId: 1,
    title: "Stack Overflow - Where Developers Learn & Share",
    url: "https://stackoverflow.com/",
    favIconUrl: "https://cdn.sstatic.net/Sites/stackoverflow/Img/favicon.ico",
    thumbnailUrl:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150'%3E%3Crect fill='%23f48024' width='200' height='150'/%3E%3Ctext x='50%25' y='50%25' fill='white' text-anchor='middle' dy='.3em' font-family='sans-serif'%3EStack Overflow%3C/text%3E%3C/svg%3E",
  },
  {
    id: 4,
    windowId: 1,
    title: "MDN Web Docs",
    url: "https://developer.mozilla.org/",
    favIconUrl: "https://developer.mozilla.org/favicon.ico",
    thumbnailUrl:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150'%3E%3Crect fill='%23005e9c' width='200' height='150'/%3E%3Ctext x='50%25' y='50%25' fill='white' text-anchor='middle' dy='.3em' font-family='sans-serif'%3EMDN%3C/text%3E%3C/svg%3E",
  },
  {
    id: 5,
    windowId: 1,
    title: "Tab without thumbnail - Example",
    url: "https://example.com/",
    favIconUrl: undefined,
    thumbnailUrl: undefined,
  },
  {
    id: 6,
    windowId: 2,
    title: "YouTube - Another Window",
    url: "https://www.youtube.com/",
    favIconUrl: "https://www.youtube.com/favicon.ico",
    thumbnailUrl:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150'%3E%3Crect fill='%23ff0000' width='200' height='150'/%3E%3Ctext x='50%25' y='50%25' fill='white' text-anchor='middle' dy='.3em' font-family='sans-serif'%3EYouTube%3C/text%3E%3C/svg%3E",
  },
  {
    id: 7,
    windowId: 1,
    title: "Twitter / X",
    url: "https://twitter.com/",
    favIconUrl: "https://abs.twimg.com/favicons/twitter.ico",
    thumbnailUrl: undefined,
  },
  {
    id: 8,
    windowId: 1,
    title:
      "Very Long Tab Title That Should Be Truncated When Displayed In The UI Component",
    url: "https://example.com/very/long/path/that/should/also/be/truncated",
    favIconUrl: "https://example.com/favicon.ico",
    thumbnailUrl:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150'%3E%3Crect fill='%239c27b0' width='200' height='150'/%3E%3Ctext x='50%25' y='50%25' fill='white' text-anchor='middle' dy='.3em' font-family='sans-serif'%3ELong Title%3C/text%3E%3C/svg%3E",
  },
];

export function getMockTabs(
  windowOnly: boolean = false,
  windowId: number = 1
): TabInfo[] {
  if (windowOnly) {
    return mockTabs.filter((tab) => tab.windowId === windowId);
  }
  return mockTabs;
}
