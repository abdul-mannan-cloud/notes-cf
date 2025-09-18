import "./globals.css"

export const metadata = {
  title: "NotesGPT",
  description: "Notes app with GPT-Realtime + Cloudflare",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <main className="container mx-auto p-6">{children}</main>
      </body>
    </html>
  )
}
