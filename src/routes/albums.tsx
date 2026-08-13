import { createFileRoute } from "@tanstack/react-router";
import { GroupBrowser } from "@/components/GroupBrowser";

export const Route = createFileRoute("/albums")({
  head: () => ({
    meta: [
      { title: "Albums — Mevet Player" },
      { name: "description", content: "Your local music grouped into albums with cover art." },
      { property: "og:title", content: "Albums — Mevet Player" },
      { property: "og:description", content: "Browse your library album by album." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <GroupBrowser title="Albums" field="album" />,
});
