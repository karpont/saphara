/** @type {import('next').NextConfig} */
module.exports = {
  transpilePackages: [
    "@saphara/wallet", "@saphara/media-tools", "@saphara/config",
    "@saphara/analytics", "@saphara/recommendation", "@saphara/security",
  ],
  async headers() {
    return [
      {
        // Tüm sayfalar: COOP same-origin-allow-popups (cüzdan popup'ları için)
        // COEP credentialless: dış görsellere izin verir, SharedArrayBuffer da çalışır
        source: "/(.*)",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
          { key: "Cross-Origin-Embedder-Policy", value: "credentialless" },
        ],
      },
      {
        // Studio + Create: FFmpeg WASM için tam cross-origin isolation
        source: "/(studio|create)(.*)",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
        ],
      },
    ];
  },
};
