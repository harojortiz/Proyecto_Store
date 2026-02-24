import { useEffect, useState } from "react";
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command";
import { useNavigate } from "react-router-dom";
import {
    Calendar,
    Settings,
    User,
    Package,
    ShoppingCart,
    Loader2
} from "lucide-react";
import { searchService, SearchResults } from "@/services/searchService";

export function GlobalSearch() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResults | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        const handleOpen = () => setOpen(true);

        document.addEventListener("keydown", down);
        window.addEventListener("open-global-search", handleOpen);

        return () => {
            document.removeEventListener("keydown", down);
            window.removeEventListener("open-global-search", handleOpen);
        };
    }, []);

    useEffect(() => {
        if (!query || query.length < 2) {
            setResults(null);
            return;
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const data = await searchService.searchGlobal(query);
                setResults(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const runCommand = (command: () => void) => {
        setOpen(false);
        command();
    };

    return (
        <CommandDialog open={open} onOpenChange={setOpen} shouldFilter={false}>
            <CommandInput
                placeholder="Buscar productos, clientes, ventas..."
                value={query}
                onValueChange={setQuery}
                className="border-none focus:ring-0"
            />
            <CommandList>
                <CommandEmpty className="py-6 text-center text-sm">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center gap-2 text-accent">
                            <Loader2 className="h-8 w-8 animate-spin" />
                            <p className="font-medium animate-pulse">Buscando en V&H Luxe...</p>
                        </div>
                    ) : query.length > 0 && query.length < 2 ? (
                        <p className="text-muted-foreground">Escribe al menos 2 caracteres para buscar.</p>
                    ) : query.length >= 2 ? (
                        <p className="text-muted-foreground">No se encontraron resultados para "{query}".</p>
                    ) : (
                        <p className="text-muted-foreground">Comienza a escribir para buscar en el sistema.</p>
                    )}
                </CommandEmpty>

                {/* Resultados de Búsqueda */}
                {results && (
                    <>
                        {results.products.length > 0 && (
                            <CommandGroup heading="Productos">
                                {results.products.map(item => (
                                    <CommandItem key={item.id} onSelect={() => runCommand(() => navigate(item.url))}>
                                        <Package className="mr-2 h-4 w-4" />
                                        <span>{item.title}</span>
                                        <span className="ml-2 text-muted-foreground text-xs">{item.subtitle}</span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}

                        {results.customers.length > 0 && (
                            <CommandGroup heading="Clientes">
                                {results.customers.map(item => (
                                    <CommandItem key={item.id} onSelect={() => runCommand(() => navigate(item.url))}>
                                        <User className="mr-2 h-4 w-4" />
                                        <span>{item.title}</span>
                                        <span className="ml-2 text-muted-foreground text-xs">{item.subtitle}</span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}

                        {results.sales.length > 0 && (
                            <CommandGroup heading="Ventas">
                                {results.sales.map(item => (
                                    <CommandItem key={item.id} onSelect={() => runCommand(() => navigate(item.url))}>
                                        <ShoppingCart className="mr-2 h-4 w-4" />
                                        <span>{item.title}</span>
                                        <span className="ml-2 text-muted-foreground text-xs">{item.subtitle}</span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}

                        {(results.products.length > 0 || results.customers.length > 0 || results.sales.length > 0) && <CommandSeparator />}
                    </>
                )}

                {/* Comandos Estáticos (siempre visibles si no hay query o búsqueda vacía) */}
                {!query && (
                    <>
                        <CommandGroup heading="Acciones Rápidas">
                            <CommandItem onSelect={() => runCommand(() => navigate("/dashboard"))}>
                                <Calendar className="mr-2 h-4 w-4" />
                                <span>Ir al Dashboard</span>
                            </CommandItem>
                            <CommandItem onSelect={() => runCommand(() => navigate("/ventas"))}>
                                <ShoppingCart className="mr-2 h-4 w-4" />
                                <span>Nueva Venta</span>
                                <CommandShortcut>⌘N</CommandShortcut>
                            </CommandItem>
                        </CommandGroup>
                        <CommandSeparator />
                        <CommandGroup heading="Ajustes">
                            <CommandItem onSelect={() => runCommand(() => navigate("/profile"))}>
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Configuración</span>
                                <CommandShortcut>⌘S</CommandShortcut>
                            </CommandItem>
                        </CommandGroup>
                    </>
                )}
            </CommandList>
        </CommandDialog>
    );
}
