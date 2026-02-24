import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useVentasStore } from "@/store/useVentasStore";
import { X, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Gem } from "lucide-react";

export function ProductFilterBar() {
    const { productsFilters, setProductFilters } = useVentasStore();

    const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value ? parseFloat(e.target.value) : undefined;
        setProductFilters({ minPrice: val });
    };

    const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value ? parseFloat(e.target.value) : undefined;
        setProductFilters({ maxPrice: val });
    };

    const clearFilters = () => {
        setProductFilters({
            minPrice: undefined,
            maxPrice: undefined,
            stockStatus: undefined,
            ordenPrecio: undefined,
            material: undefined,
            stone: undefined,
        });
    };

    const activeFiltersCount = [
        productsFilters.minPrice,
        productsFilters.maxPrice,
        productsFilters.stockStatus,
        productsFilters.ordenPrecio
    ].filter(Boolean).length;

    return (
        <div className="flex flex-wrap items-center gap-2 mb-4">
            {/* Filtro de Stock */}
            <Select
                value={productsFilters.stockStatus || "all"}
                onValueChange={(val) => setProductFilters({ stockStatus: val === "all" ? undefined : val as any })}
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Estado del Stock" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todo el stock</SelectItem>
                    <SelectItem value="available">Disponible</SelectItem>
                    <SelectItem value="low">Stock Bajo (≤ 5)</SelectItem>
                    <SelectItem value="out">Agotado</SelectItem>
                </SelectContent>
            </Select>

            {/* Rango de Precios (Popover para no ocupar mucho espacio) */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="border-dashed">
                        <SlidersHorizontal className="mr-2 h-4 w-4" />
                        Precio
                        {(productsFilters.minPrice || productsFilters.maxPrice) && (
                            <Badge variant="secondary" className="ml-2 rounded-sm px-1 font-normal">
                                Activo
                            </Badge>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="start">
                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <h4 className="font-medium leading-none">Rango de Precios</h4>
                            <p className="text-sm text-muted-foreground">
                                Filtrar productos por precio sugerido.
                            </p>
                        </div>
                        <div className="grid gap-2">
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label htmlFor="minPrice">Mínimo</Label>
                                <Input
                                    id="minPrice"
                                    type="number"
                                    placeholder="0"
                                    className="col-span-2 h-8"
                                    value={productsFilters.minPrice || ''}
                                    onChange={handleMinPriceChange}
                                />
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label htmlFor="maxPrice">Máximo</Label>
                                <Input
                                    id="maxPrice"
                                    type="number"
                                    placeholder="Sin límite"
                                    className="col-span-2 h-8"
                                    value={productsFilters.maxPrice || ''}
                                    onChange={handleMaxPriceChange}
                                />
                            </div>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>

            {/* Ordenamiento */}
            <Select
                value={productsFilters.ordenPrecio || "none"}
                onValueChange={(val) => setProductFilters({ ordenPrecio: val === "none" ? undefined : val as any })}
            >
                <SelectTrigger className="w-[180px] border-dashed">
                    <ArrowUpDown className="mr-2 h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Ordenar por precio" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="none">Por defecto (Recientes)</SelectItem>
                    <SelectItem value="asc">Precio: Menor a Mayor</SelectItem>
                    <SelectItem value="desc">Precio: Mayor a Menor</SelectItem>
                </SelectContent>
            </Select>

            {/* Separador visual opcional */}
            <div className="h-8 w-[1px] bg-border/50 mx-1 hidden lg:block" />

            {/* Filtros Especializados de Joyería */}
            <Select
                value={productsFilters.material || "all"}
                onValueChange={(val) => setProductFilters({ material: val === "all" ? undefined : val })}
            >
                <SelectTrigger className="w-[140px] bg-accent/5 border-accent/20">
                    <Sparkles className="mr-2 h-4 w-4 text-accent" />
                    <SelectValue placeholder="Material" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Cualquier Material</SelectItem>
                    <SelectItem value="Oro">Oro</SelectItem>
                    <SelectItem value="Plata">Plata</SelectItem>
                    <SelectItem value="Oro Rosa">Oro Rosa</SelectItem>
                    <SelectItem value="Acero">Acero Quirúrgico</SelectItem>
                </SelectContent>
            </Select>

            <Select
                value={productsFilters.stone || "all"}
                onValueChange={(val) => setProductFilters({ stone: val === "all" ? undefined : val })}
            >
                <SelectTrigger className="w-[140px] bg-accent/5 border-accent/20">
                    <Gem className="mr-2 h-4 w-4 text-accent" />
                    <SelectValue placeholder="Piedra" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Sin Piedra / Todas</SelectItem>
                    <SelectItem value="Diamante">Diamante</SelectItem>
                    <SelectItem value="Esmeralda">Esmeralda</SelectItem>
                    <SelectItem value="Rubí">Rubí</SelectItem>
                    <SelectItem value="Zafiro">Zafiro</SelectItem>
                    <SelectItem value="Circonia">Circonia</SelectItem>
                </SelectContent>
            </Select>

            {/* Botón Limpiar */}
            {activeFiltersCount > 0 || productsFilters.material || productsFilters.stone && (
                <Button
                    variant="ghost"
                    onClick={clearFilters}
                    className="h-8 px-2 lg:px-3 text-muted-foreground hover:text-accent transition-colors"
                >
                    Limpiar filtros
                    <X className="ml-2 h-4 w-4" />
                </Button>
            )}
        </div>
    );
}
