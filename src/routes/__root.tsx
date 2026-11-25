import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { SmoothScroll } from "@/components/site/smooth-scroll";
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
      { name: "alpen-react-share-meta", content: "true" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "AlpenSMP – Deutscher Minecraft Survival Server" },
      {
        name: "twitter:description",
        content: "Deutscher Vanilla-Survival-Server. Java & Bedrock, faire Community.",
      },
      { name: "twitter:image", content: "https://alpensmp.net/og.png" },
      { property: "og:title", content: "AlpenSMP – Deutscher Minecraft Survival Server" },
      {
        property: "og:description",
        content: "Deutscher Vanilla-Survival-Server. Java & Bedrock, faire Community.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://alpensmp.net/og.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
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
        <script
          dangerouslySetInnerHTML={{
            __html:
              "var reloadForChunkError=function(){var k='alpen-chunk-reload-at';var last=Number(sessionStorage.getItem(k)||0);if(Date.now()-last<20000)return;sessionStorage.setItem(k,String(Date.now()));location.reload()};window.addEventListener('vite:preloadError',function(e){e.preventDefault();reloadForChunkError()});window.addEventListener('unhandledrejection',function(e){var m=String(e.reason&&(e.reason.message||e.reason));var chunkError=m.indexOf('dynamically imported module')>=0||m.indexOf('importing a module script failed')>=0||(m.indexOf('Cannot read properties of undefined')>=0&&(m.indexOf('default')>=0||m.indexOf('component')>=0));if(chunkError)reloadForChunkError()});window.addEventListener('load',function(){sessionStorage.removeItem('alpen-chunk-reload');setTimeout(function(){sessionStorage.removeItem('alpen-chunk-reload-at')},20000)},{once:true});",
          }}
        />
        <script src="/season-loader.js" />
      </head>
      <body>
        <PreviewHostBridge />
        <SmoothScroll />
        <AuthProvider>
          <Outlet />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}
