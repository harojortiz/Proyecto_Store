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
  UserCog,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, []);

  useEffect(() => {
    const savedSidebarState = localStorage.getItem('sidebarOpen');
    if (savedSidebarState !== null) {
      setSidebarOpen(savedSidebarState === 'true');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const toggleSidebar = () => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);
    localStorage.setItem('sidebarOpen', String(newState));
  };

  const navItems = [
    { path: "/", icon: Home, label: "Dashboard" },
    { path: "/productos", icon: Package, label: "Productos" },
    { path: "/ventas", icon: ShoppingCart, label: "Ventas" },
    { path: "/clientes", icon: Users, label: "Clientes" },
  ];

  // Determinar si el sidebar debe mostrarse expandido
  const shouldShowExpanded = sidebarOpen || isHovering;

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar Desktop */}
      <aside
        className={cn(
          "hidden md:flex flex-col bg-card border-r border-border transition-all duration-500 ease-in-out",
          shouldShowExpanded ? "w-64" : "w-20"
        )}
        onMouseEnter={() => !sidebarOpen && setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Logo y Toggle */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className={cn("flex items-center gap-3 transition-all duration-500 ease-in-out", !shouldShowExpanded && "opacity-0 w-0 overflow-hidden")}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 
                flex items-center justify-center shadow-lg ring-1 ring-slate-600/20
                transition-all duration-500 ease-in-out hover:scale-105 hover:shadow-xl">
              <svg
                className="w-6 h-6 text-amber-400"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2L4 7v3.5c0 5.25 3.5 10.15 8 11.5 4.5-1.35 8-6.25 8-11.5V7l-8-5zm0 2.18l6 3.75v2.57c0 4.35-2.8 8.4-6 9.6-3.2-1.2-6-5.25-6-9.6V7.93l6-3.75zM12 7l-3 3 3 3 3-3-3-3z" />
              </svg>
            </div>
            {shouldShowExpanded && (
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                  V&H Store
                </h1>
                <p className="text-[10px] text-muted-foreground font-medium tracking-wide">LUXURY TIMEPIECES</p>
              </div>
            )}
          </div>

          {/* Logo when collapsed */}
          {!shouldShowExpanded && (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 
                flex items-center justify-center shadow-lg ring-1 ring-slate-600/20
                transition-all duration-500 ease-in-out hover:scale-105 hover:shadow-xl mx-auto">
              <svg
                className="w-6 h-6 text-amber-400"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2L4 7v3.5c0 5.25 3.5 10.15 8 11.5 4.5-1.35 8-6.25 8-11.5V7l-8-5zm0 2.18l6 3.75v2.57c0 4.35-2.8 8.4-6 9.6-3.2-1.2-6-5.25-6-9.6V7.93l6-3.75zM12 7l-3 3 3 3 3-3-3-3z" />
              </svg>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className={cn("h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800", !shouldShowExpanded && "absolute right-2")}
          >
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 transition-all",
                    !shouldShowExpanded && "justify-center px-2"
                  )}
                  title={!shouldShowExpanded ? item.label : undefined}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {shouldShowExpanded && <span>{item.label}</span>}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* User Section - Simplified */}
        <div className="p-3 border-t border-border">
          {user && (
            <>
              {/* User Info - Solo cuando está expandido */}
              {shouldShowExpanded && (
                <div className="px-3 py-2 bg-muted rounded-lg mb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-sm font-medium truncate">{user.name}</span>
                  </div>
                  {user.role === 'ADMIN' && (
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded inline-block">
                      Admin
                    </span>
                  )}
                </div>
              )}

              {/* Settings Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full gap-3",
                      !shouldShowExpanded && "justify-center px-2"
                    )}
                  >
                    <Settings className="w-5 h-5 shrink-0" />
                    {shouldShowExpanded && <span>Configuración</span>}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email || 'Sin email'}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <UserCog className="w-4 h-4 mr-2" />
                      Mi Perfil
                    </Link>
                  </DropdownMenuItem>

                  {user.role === 'ADMIN' && (
                    <DropdownMenuItem asChild>
                      <Link to="/usuarios" className="cursor-pointer">
                        <Users className="w-4 h-4 mr-2" />
                        Gestión de Usuarios
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer">
                    {theme === 'light' ? (
                      <>
                        <Moon className="w-4 h-4 mr-2" />
                        Modo Oscuro
                      </>
                    ) : (
                      <>
                        <Sun className="w-4 h-4 mr-2" />
                        Modo Claro
                      </>
                    )}
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border backdrop-blur-sm bg-card/95">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 
                flex items-center justify-center shadow-lg ring-1 ring-slate-600/20">
              <svg
                className="w-5 h-5 text-amber-400"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2L4 7v3.5c0 5.25 3.5 10.15 8 11.5 4.5-1.35 8-6.25 8-11.5V7l-8-5zm0 2.18l6 3.75v2.57c0 4.35-2.8 8.4-6 9.6-3.2-1.2-6-5.25-6-9.6V7.93l6-3.75zM12 7l-3 3 3 3 3-3-3-3z" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">V&H Store</h1>
              <p className="text-[9px] text-muted-foreground font-medium tracking-wide">LUXURY TIMEPIECES</p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-border bg-card p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className="w-full justify-start gap-3"
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              );
            })}

            <div className="pt-2 border-t border-border space-y-2">
              {user && (
                <>
                  <div className="px-3 py-2 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{user.name}</span>
                      {user.role === 'ADMIN' && (
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded ml-auto">
                          Admin
                        </span>
                      )}
                    </div>
                  </div>

                  <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start gap-3">
                      <UserCog className="w-5 h-5" />
                      <span>Mi Perfil</span>
                    </Button>
                  </Link>

                  {user.role === 'ADMIN' && (
                    <Link to="/usuarios" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start gap-3">
                        <Users className="w-5 h-5" />
                        <span>Gestión de Usuarios</span>
                      </Button>
                    </Link>
                  )}

                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3"
                    onClick={toggleTheme}
                  >
                    {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                    <span>Cambiar Tema</span>
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Cerrar Sesión</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-8 md:py-8 mt-16 md:mt-0">
          {children}
        </div>
      </main>
    </div>
  );
}
