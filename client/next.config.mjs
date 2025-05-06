// next.config.js
export function webpack(config, { isServer }) {
    if (!isServer) {
        config.resolve.alias['pdfjs-dist'] = 'pdfjs-dist/legacy/build/pdf';
    }
    return config;
}
  