import { createFileRoute } from "@tanstack/react-router";
import { GroupBrowser } from "@/components/GroupBrowser";

export const Route = createFileRoute("/folders")({
  head: () => ({
    meta: [
      { title: "Folders — Mevet Player" },
      { name: "description", content: "Your music grouped by the folders it lives in." },
      { property: "og:title", content: "Folders — Mevet Player" },
      { property: "og:description", content: "Browse your library folder by folder." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <GroupBrowser title="Folders" field="folder" />,
});
