import "./globals.css";

export const metadata = {
  title: "V Research",
  description: "Research Command Center"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
