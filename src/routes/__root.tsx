import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { SeasonalDecorations } from "@/components/site/season-decor";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "AlpenSMP – Deutscher Minecraft Survival Server" },
      {
        name: "description",
        content:
          "AlpenSMP ist ein deutschsprachiger Vanilla-Survival-Server für Java und Bedrock. Faire Community, Claims, Simple Voice Chat – ohne Pay-to-Win.",
      },
      { name: "theme-color", content: "#090909" },
    ],
    links: [
      { rel: "icon", type: "image/png", href: "/logo.png" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
    ],
  }),
  component: RootDocument,
});

function RootDocument() {
  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script src="/season-loader.js" />
      </head>
      <body>
        <PreviewHostBridge />
        <SeasonalDecorations />
        <AuthProvider>
          <Outlet />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}
