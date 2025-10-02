import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Bookmark, BarChart3, User, Settings } from "lucide-react";

const navigationItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: BarChart3,
  },
  {
    title: "Opportunities",
    url: "/opportunities",
    icon: Search,
  },
  {
    title: "My Pipeline",
    url: "/pipeline",
    icon: Bookmark,
  },
];

export default function Layout({ children }) {
  const location = useLocation();

  return (
    <div className="min-h-screen flex w-full bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-neura-primary border-r border-neura-secondary flex flex-col">
        {/* Header */}
        <div className="border-b border-neura-secondary p-6">
          <div className="flex items-center gap-3">
            <img
              src={`${import.meta.env.BASE_URL}500x500-NC_Logo.png`}
              alt="RFP Discovery Logo"
              className="w-10 h-10 rounded-lg object-cover"
            />
            <div>
              <h2 className="font-bold text-white text-lg">RFP Discovery</h2>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 py-2">
              Navigation
            </p>
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.url;
              return (
                <Link
                  key={item.title}
                  to={item.url}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors duration-200 ${
                    isActive
                      ? 'bg-neura-teal text-white font-medium'
                      : 'hover:bg-neura-secondary text-gray-300 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-neura-secondary p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-neura-teal rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-sm truncate">MODUS Planning</p>
              <p className="text-xs text-gray-400 truncate">RFP Intelligence</p>
            </div>
            <Link to="/profile" className="hover:bg-neura-secondary p-2 rounded-lg transition-colors">
              <Settings className="w-4 h-4 text-gray-400 hover:text-white" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
