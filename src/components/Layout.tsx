import { Link, useLocation } from "react-router-dom";
import {
  Home,
  ShoppingCart,
  Users,
  Package,
  Moon,
  Sun,
  Gem,
  LogOut,
  User,
  UserCog
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const navItems = [
    { path: "/", icon: Home, label: "Dashboard" },
    { path: "/productos", icon: Package, label: "Productos" },
    { path: "/ventas", icon: ShoppingCart, label: "Ventas" },
    { path: "/clientes", icon: Users, label: "Clientes" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-x-hidden">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 
                flex items-center justify-center shadow-lg shadow-yellow-500/30
                transition-all duration-300 hover:scale-105 hover:shadow-yellow-500/50">
              <Gem className="w-5 h-5 text-white drop-shadow-[0_0_4px_rgba(255,255,255,0.8)]" />
            </div>

            <h1 className="text-xl font-bold text-foreground whitespace-nowrap">
              V&H Store
            </h1>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className="gap-2"
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {user && (
              <div className="flex items-center gap-2">
                <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-muted rounded-md">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{user.name}</span>
                  {user.role === 'ADMIN' && (
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                      Admin
                    </span>
                  )}
                </div>

                {/* Menú de usuario para móviles y escritorio */}
                <Link to="/profile">
                  <Button variant="ghost" size="icon" title="Mi Perfil">
                    <UserCog className="w-5 h-5" />
                  </Button>
                </Link>

                {user.role === 'ADMIN' && (
                  <Link to="/usuarios" className="hidden md:block">
                    <Button variant="ghost" size="icon" title="Gestión de Usuarios">
                      <Users className="w-5 h-5" />
                    </Button>
                  </Link>
                )}
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 overflow-y-auto">
        {children}
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border">
        <div className="flex items-center justify-around px-4 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  className="flex flex-col gap-1 h-auto py-2"
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs">{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
