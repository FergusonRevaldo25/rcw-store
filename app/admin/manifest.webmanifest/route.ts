export function GET() {
  const manifest = {
    name: "RCW Staff",
    short_name: "RCW Staff",
    description: "RCW Store staff dashboard and point of sale",
    start_url: "/admin",
    scope: "/admin/",
    display: "standalone",
    background_color: "#07060b",
    theme_color: "#07060b",
    icons: [
      { src: "/icons/staff-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/staff-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
  return new Response(JSON.stringify(manifest), {
    headers: { "Content-Type": "application/manifest+json" },
  });
}