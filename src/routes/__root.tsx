import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import appCss from "../styles.css?url";

const APP_NAME = "Bankgeheimnis im Park";

export const Route = createRootRoute({
  notFoundComponent: () => null,
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: APP_NAME },
      { name: "theme-color", content: "#0a0a0a" },
      {
        name: "description",
        content: "Die Oma, die Parabellum und zu viele Talahons im Park. Kannst du den Highscore knacken?",
      },
      { property: "og:title", content: "Bankgeheimnis im Park – Moorhuhn-Action" },
      { property: "og:description", content: "Die Oma, die Parabellum und zu viele Talahons im Park. Knacke den Highscore!" },
      { property: "og:image", content: "https://talahons-im-park.vercel.app/logo.png" },
      { property: "og:url", content: "https://talahons-im-park.vercel.app" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://talahons-im-park.vercel.app/logo.png" },
    ],
    links: [
      { rel: "icon", type: "image/png", href: "/logo.png" },
      { rel: "shortcut icon", href: "/logo.png" },
      { rel: "apple-touch-icon", href: "/logo.png" },
      { rel: "stylesheet", href: appCss },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap",
      },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
    ],
  }),
  component: () => (
    <html lang="de" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="bg-ink text-paper antialiased">
        <PreviewHostBridge />
        <AuthProvider>
          <Outlet />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});
