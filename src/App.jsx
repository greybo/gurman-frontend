// src/App.jsx
import React, { useState, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  BarChart2, LogOut, Settings as SettingsIcon, ShoppingCart, Package,
  FileSpreadsheet, Menu, X, ChevronLeft, Clock, Activity, ClipboardList, TrendingUp, Home, ShoppingBag
} from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import ExcelManager from './pages/ExcelManager';
import TestPage from './pages/TestPage';
import LoginPage from './pages/LoginPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import SalesPage from './pages/SalesPage';
import OrdersPage from './pages/OrdersPage';
import ProcessingTimePage from './pages/ProcessingTimePage';
import StatisticsPage from './pages/StatisticsPage';
import AuditPage from './pages/AuditPage';
import WorkersPage from './pages/WorkersPage';
import DashboardPage from './pages/DashboardPage';
import AllOrdersPage from './pages/AllOrdersPage';

// Sidebar context to share collapsed state
const SidebarContext = createContext({ collapsed: false, setCollapsed: () => {} });
export const useSidebar = () => useContext(SidebarContext);

const navGroups = [
  {
    label: null, // no section header — top-level item
    items: [
      { path: '/dashboard', label: 'Головна', icon: Home },
    ],
  },
  {
    label: 'Операції',
    items: [
      { path: '/orders', label: 'Замовлення', icon: Package },
      { path: '/all-orders', label: 'Всі замовлення', icon: ShoppingBag },
      { path: '/sales', label: 'Продажі', icon: ShoppingCart },
      { path: '/audit', label: 'Переоблік', icon: ClipboardList },
      { path: '/excel', label: 'Excel Manager', icon: FileSpreadsheet },
    ],
  },
  {
    label: 'Аналітика',
    items: [
      { path: '/', label: 'Аналітика', icon: BarChart2 },
      { path: '/statistics', label: 'Статистика', icon: Activity },
      { path: '/processing-time', label: 'Час обробки', icon: Clock },
      { path: '/workers', label: 'Продуктивність', icon: TrendingUp },
    ],
  },
  {
    label: 'Налаштування',
    items: [
      { path: '/settings', label: 'Налаштування', icon: SettingsIcon },
    ],
  },
];

function Sidebar({ collapsed, setCollapsed }) {
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!currentUser) return null;

  const handleLogout = async () => {
    try { await logout(); } catch (e) { console.error('Logout error:', e); }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-gray-200"
      >
        <Menu size={20} className="text-gray-600" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50
        flex flex-col transition-all duration-300 ease-in-out
        ${collapsed ? 'w-[72px]' : 'w-[260px]'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand */}
        <div className={`flex items-center h-16 px-5 border-b border-gray-100 ${collapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">G</span>
            </div>
            {!collapsed && <span className="font-semibold text-gray-900 text-lg">Gurman</span>}
          </div>
          <button
            onClick={() => { setCollapsed(!collapsed); setMobileOpen(false); }}
            className="hidden lg:flex p-1.5 rounded-md hover:bg-gray-100 text-gray-400 transition-colors"
          >
            <ChevronLeft size={16} className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-md hover:bg-gray-100 text-gray-400"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          {navGroups.map((group, idx) => (
            <div key={idx} className={idx > 0 ? 'mt-4' : ''}>
              {group.label && (
                collapsed ? (
                  <div className="mx-3 my-2 h-px bg-gray-100" />
                ) : (
                  <p className="px-3 mb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                    {group.label}
                  </p>
                )
              )}
              <div className="space-y-1">
                {group.items.map(({ path, label, icon: Icon }) => (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setMobileOpen(false)}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                      ${isActive(path)
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                    title={collapsed ? label : undefined}
                  >
                    <Icon size={20} className={`flex-shrink-0 ${isActive(path) ? 'text-brand-600' : ''}`} />
                    {!collapsed && <span>{label}</span>}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className={`border-t border-gray-100 p-3 ${collapsed ? 'items-center' : ''}`}>
          {!collapsed && (
            <div className="px-3 py-2 mb-1">
              <p className="text-xs text-gray-400 truncate">{currentUser.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`
              flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium
              text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-150
              ${collapsed ? 'justify-center' : ''}
            `}
            title={collapsed ? 'Вийти' : undefined}
          >
            <LogOut size={20} className="flex-shrink-0" />
            {!collapsed && <span>Вийти</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

function AppLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      <div className="min-h-screen bg-gray-50/80">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        <main className={`transition-all duration-300 ${collapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'}`}>
          <div className="p-6 lg:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarContext.Provider>
  );
}

function AppRoutes() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const isLogin = location.pathname === '/login';

  if (isLogin || !currentUser) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<LoginPage />} />
      </Routes>
    );
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<PrivateRoute><AnalyticsPage /></PrivateRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/sales" element={<PrivateRoute><SalesPage /></PrivateRoute>} />
        <Route path="/orders" element={<PrivateRoute><OrdersPage /></PrivateRoute>} />
        <Route path="/all-orders" element={<PrivateRoute><AllOrdersPage /></PrivateRoute>} />
        <Route path="/processing-time" element={<PrivateRoute><ProcessingTimePage /></PrivateRoute>} />
        <Route path="/statistics" element={<PrivateRoute><StatisticsPage /></PrivateRoute>} />
        <Route path="/workers" element={<PrivateRoute><WorkersPage /></PrivateRoute>} />
        <Route path="/audit" element={<PrivateRoute><AuditPage /></PrivateRoute>} />
        <Route path="/excel" element={<PrivateRoute><ExcelManager /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
        <Route path="/test" element={<PrivateRoute><TestPage /></PrivateRoute>} />
      </Routes>
    </AppLayout>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}
