import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { Suspense } from "react";
import LoadingFallback from "./LoadingFallback";
import {
  Home,
  ShoppingCart,
  Users,
  Package,
  Moon,
  Sun,
  Settings,
  User,
  UserCog,
  LogOut,
  Bell,
  Search,
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useState } from "react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import logo from "@/assets/logo.png";
import { GlobalSearch } from "./GlobalSearch";
import { useTheme } from "next-themes";
import { Input } from "./ui/input";

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { setTheme, theme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const navItems = [
    { path: "/", icon: Home, label: "Inicio" },
    { path: "/clientes", icon: Users, label: "Clientes" },
    { path: "/productos", icon: Package, label: "Inventario" },
    { path: "/ventas", icon: ShoppingCart, label: "Ventas" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      {/* Top Header Section */}
      <header className="h-20 flex items-center justify-between px-6 border-none header-glass sticky top-0 z-50">
        <div className="flex items-center gap-8">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-primary shrink-0 transition-transform group-hover:scale-105">
              <img
                src={logo}
                alt="Logo"
                className="w-full h-full object-contain scale-[1.8]"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 dark:from-white dark:to-slate-400 bg-clip-text text-transparent uppercase">
                V&H Luxe
              </h1>
              <p className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase font-medium leading-none">Alta Relojería</p>
            </div>
          </Link>
        </div>



        {/* Right Actions - Extremely Minimal */}
        <div className="flex items-center gap-4">
          <div className="h-4 w-[1px] bg-border opacity-50 mx-1 hidden sm:block" />

          {/* Buscador Minimalista */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.dispatchEvent(new CustomEvent('open-global-search'))}
            className="h-10 w-10 rounded-full hover:bg-secondary group transition-all"
            title="Buscador Global (⌘K)"
          >
            <Search className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
          </Button>

          <TooltipProvider delayDuration={400}>
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-10 w-10 p-0 rounded-full hover:bg-secondary relative group transition-all">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center overflow-hidden border border-border group-hover:border-accent/40 transition-colors">
                        <User className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
                      </div>
                      {/* Indicador sutil de Administrador */}
                      {user?.role === 'ADMIN' && (
                        <span className="absolute bottom-1 right-1 w-2 h-2 bg-accent rounded-full border-2 border-white dark:border-slate-900 shadow-sm" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  align="end"
                  className="p-0 overflow-hidden rounded-xl border-white/10 shadow-xl"
                >
                  <div className="px-4 py-3 bg-primary/95 backdrop-blur-md text-primary-foreground min-w-[160px]">
                    <p className="text-xs font-black tracking-wider uppercase text-accent">
                      {user?.role === 'ADMIN' ? '★ Administrador' : '● Operador'}
                    </p>
                    <p className="text-sm font-bold mt-0.5">{user?.name}</p>
                    {user?.email && (
                      <p className="text-[10px] opacity-50 font-medium truncate mt-0.5">{user.email}</p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end" className="w-64 mt-2 rounded-xl p-2 border-border shadow-xl bg-white/95 backdrop-blur-lg">
                <DropdownMenuLabel className="px-3 py-3">
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-primary">{user?.name}</p>
                      {user?.role === 'ADMIN' && (
                        <span className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Administrador</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground font-medium truncate">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="mx-1 my-2" />

                {/* Controles de Sistema movidos aquí para limpieza */}
                <div className="px-2 py-2 grid grid-cols-2 gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleTheme}
                    className="rounded-lg h-9 px-2 gap-2 text-xs font-bold text-muted-foreground hover:bg-secondary justify-start"
                  >
                    {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                    {theme === 'light' ? 'Oscuro' : 'Claro'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-lg h-9 px-2 gap-2 text-xs font-bold text-muted-foreground hover:bg-secondary justify-start"
                  >
                    <Bell className="w-4 h-4" />
                    Avisos
                  </Button>
                </div>

                <DropdownMenuSeparator className="mx-1 my-2" />

                <DropdownMenuItem asChild className="rounded-lg cursor-pointer py-2.5 focus:bg-secondary/50">
                  <Link to="/profile">
                    <UserCog className="w-4 h-4 mr-3 text-muted-foreground" />
                    <span className="font-bold text-xs uppercase tracking-widest">Mi Perfil</span>
                  </Link>
                </DropdownMenuItem>
                {user?.role === 'ADMIN' && (
                  <DropdownMenuItem asChild className="rounded-lg cursor-pointer py-2.5 focus:bg-secondary/50">
                    <Link to="/usuarios">
                      <Users className="w-4 h-4 mr-3 text-muted-foreground" />
                      <span className="font-bold text-xs uppercase tracking-widest">Gestionar Usuarios</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="mx-1 my-2" />
                <DropdownMenuItem onClick={logout} className="rounded-lg cursor-pointer py-2.5 text-red-600 focus:text-red-700 focus:bg-red-50">
                  <LogOut className="w-4 h-4 mr-3" />
                  <span className="font-bold text-xs uppercase tracking-widest">Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TooltipProvider>
        </div>
      </header>

      {/* Navigation Sub-header (Tabs) - Simplified */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-border/40">
        <nav className="flex items-center gap-1 bg-secondary/30 p-1 rounded-full w-fit">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant="ghost"
                  className={cn(
                    "h-9 px-6 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200",
                    isActive
                      ? "bg-white dark:bg-slate-700 shadow-sm text-primary"
                      : "text-muted-foreground hover:text-primary hover:bg-white/50"
                  )}
                >
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        {location.pathname === '/' ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="luxe-button-gold rounded-full h-10 px-6 gap-2 text-xs">
                <Plus className="w-4 h-4" />
                Nuevo Registro
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl p-2 bg-white/95 backdrop-blur-lg border-border shadow-xl">
              <DropdownMenuLabel className="px-3 py-2 text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Acciones Rápidas</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/ventas?action=new')} className="rounded-lg cursor-pointer py-2.5">
                <ShoppingCart className="w-4 h-4 mr-3 text-accent" />
                <span className="font-bold text-xs uppercase tracking-widest">Nueva Venta</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/productos?action=new')} className="rounded-lg cursor-pointer py-2.5">
                <Package className="w-4 h-4 mr-3 text-accent" />
                <span className="font-bold text-xs uppercase tracking-widest">Nuevo Producto</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/clientes?action=new')} className="rounded-lg cursor-pointer py-2.5">
                <Users className="w-4 h-4 mr-3 text-accent" />
                <span className="font-bold text-xs uppercase tracking-widest">Nuevo Cliente</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            onClick={() => {
              const action = location.pathname === '/ventas' ? 'Venta' :
                location.pathname === '/productos' ? 'Producto' : 'Cliente';
              navigate(`${location.pathname}?action=new`);
            }}
            className="luxe-button-gold rounded-full h-10 px-6 gap-2 text-xs"
          >
            <Plus className="w-4 h-4" />
            {location.pathname === '/ventas' ? 'Nueva Venta' :
              location.pathname === '/productos' ? 'Nuevo Producto' : 'Nuevo Cliente'}
          </Button>
        )}
      </div>

      {/* Main Content Area */}
      <main className="flex-1 px-6 pb-12 overflow-y-auto custom-scrollbar bg-slate-50/30">
        <div className="max-w-[1600px] mx-auto py-8">
          <Suspense fallback={<LoadingFallback />}>
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </Suspense>
        </div>
      </main>

      <GlobalSearch />
    </div>
  );
}
