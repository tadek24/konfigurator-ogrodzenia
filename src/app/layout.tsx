import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'LINE / Konfigurator ogrodzeń', description: 'Techniczny edytor ogrodzeń 2D i 3D.' };
export default function Layout({ children }: Readonly<{children: React.ReactNode}>) { return <html lang="pl"><body>{children}</body></html>; }
