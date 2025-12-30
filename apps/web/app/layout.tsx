import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Mesa de Análise - Projeto SaaS',
  description: 'Plataforma SaaS para análise técnica de mercado financeiro.',
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
