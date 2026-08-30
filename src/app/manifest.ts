import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Udaya Cricket Club',
    short_name: 'Udaya CC',
    description: 'Player profiles, match stories, and club updates.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F1EAD9',
    theme_color: '#1F3A2E',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  };
}
