import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GASA objetivos - Familia Galindo Salomon',
  description: 'Aplicación de administración del hogar y finanzas para la Familia Galindo Salomon (GASA objetivos). Gestión de ingresos, egresos, cuotas, metas de ahorro y mensajes positivos.',
  openGraph: {
    title: 'GASA objetivos - Familia Galindo Salomon',
    description: 'Gestión familiar y metas de la Familia Galindo Salomon.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GASA objetivos - Familia Galindo Salomon',
    description: 'Gestión familiar y metas de la Familia Galindo Salomon.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-emerald-500/30 selection:text-emerald-200" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
