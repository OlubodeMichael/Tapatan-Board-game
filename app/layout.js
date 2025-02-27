import "./globals.css";

export const metadata = {
  title: "Tapatan Game",
  description: "A strategic two-player game",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="w-full max-w-4xl p-4">{children}</div>
      </body>
    </html>
  );
}
