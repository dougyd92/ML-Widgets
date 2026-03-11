import type { ReactNode } from "react";

interface Props {
  title?: string;
  children: ReactNode;
}

export function Layout({ title, children }: Props) {
  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-4">
        <a href="/" className="text-lg font-bold text-gray-800 hover:text-blue-600">
          ML Widgets
        </a>
        {title && (
          <>
            <span className="text-gray-300">/</span>
            <span className="text-sm text-gray-500">{title}</span>
          </>
        )}
      </nav>
      {children}
    </div>
  );
}
