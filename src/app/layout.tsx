import type { Metadata } from 'next';
import './globals.css';
import './site.css';
export const metadata: Metadata = { title: 'Ogrodzenia Studio / Projekt i oferta', description: 'Zaprojektuj ogrodzenie w 2D, obejrzyj model 3D i przygotuj ofertę.' };
export default function Layout({ children }: Readonly<{children: React.ReactNode}>) { return <html lang="pl"><body>{children}</body></html>; }
