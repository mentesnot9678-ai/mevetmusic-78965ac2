import { createFileRoute } from "@tanstack/react-router";
import { GroupBrowser } from "@/components/GroupBrowser";

export const Route = createFileRoute("/artists")({
  head: () => ({
    meta: [
      { title: "Artists — Mevet Player" },
      { name: "description", content: "Every artist in your local music library." },
      { property: "og:title", content: "Artists — Mevet Player" },
      { property: "og:description", content: "Browse your library by artist." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <GroupBrowser title="Artists" field="artist" />,
});
