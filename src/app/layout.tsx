import type { Metadata } from "next";
import "./globals.css";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Aviso Claro MX · Demo",
  description: "Avisos basados en evidencia ficticia, con revisión humana.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-MX">
      <body>{children}</body>
    </html>
  );
}
