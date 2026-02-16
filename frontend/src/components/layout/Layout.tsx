import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import { useStore } from '../../context/store';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const sidebarOpen = useStore((s) => s.sidebarOpen);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Skip link for screen readers — WCAG AAA */}
      <a href="#main-content" className="skip-link" aria-label="Skip to main content">
        Skip to main content
      </a>

      <div className="flex flex-1">
        <Sidebar />
        <div
          className={`flex-1 flex flex-col transition-all duration-300 ${
            sidebarOpen ? 'md:ml-64' : 'md:ml-20'
          }`}
        >
          <Header />
          <main
            id="main-content"
            role="main"
            aria-label="Main content area"
            className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto"
          >
            {children}
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}
