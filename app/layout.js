import "./globals.css";

export const metadata = {
  title: "Project Management System",
  description: "Manage your projects and tasks",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <nav className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <a href="/" className="text-xl font-bold text-indigo-600">
              ProjectFlow
            </a>
            <span className="text-sm text-gray-500">
              Project Management System
            </span>
          </div>
        </nav>
        <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
