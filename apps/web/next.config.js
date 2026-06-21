const createNextIntlPlugin = require("next-intl/plugin");
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@saphara/wallet", "@saphara/media-tools", "@saphara/config",
    "@saphara/analytics", "@saphara/recommendation", "@saphara/security",
  ],
  async headers() {
    return [
      {
        // Tüm sayfalar (Studio/Create dahil): COOP same-origin-allow-popups (cüzdan popup'ları için)
        // COEP credentialless: dış görsellere CORP header'ı olmasa da izin verir,
        // AYNI ZAMANDA cross-origin isolation sağlar (FFmpeg WASM/SharedArrayBuffer için yeterli).
        // Önceden Studio/Create'de "require-corp" kullanılıyordu — bu, CORP header'sız tüm
        // dış görselleri (avatar, örnek resim) sessizce engelliyordu. credentialless ile değiştirildi.
        source: "/(.*)",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
          { key: "Cross-Origin-Embedder-Policy", value: "credentialless" },
        ],
      },
    ];
  },
};

module.exports = withNextIntl(nextConfig);
