import './globals.css';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Gimso - 자동 블로그 포스팅 플랫폼',
  description: 'AI 기반 자동 블로그 포스팅 및 다국어 번역 서비스',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-gimso-primary via-gimso-secondary to-gimso-accent">
          <nav className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl font-bold text-gimso-primary">
                    🚀 Gimso
                  </div>
                  <span className="text-gray-600 text-sm">
                    AI 블로그 자동화 플랫폼
                  </span>
                </div>
                <div className="text-sm text-gray-500">v1.0.0</div>
              </div>
            </div>
          </nav>

          <main className="container mx-auto px-4 py-8">{children}</main>

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </div>
      </body>
    </html>
  );
}
