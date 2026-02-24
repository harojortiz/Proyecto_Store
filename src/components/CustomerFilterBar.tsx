import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useVentasStore } from "@/store/useVentasStore";
import { X, Calendar as CalendarIcon } from "lucide-react";

export function CustomerFilterBar() {
    const { customerFilters, setCustomerFilters } = useVentasStore();

    const clearFilters = () => {
        setCustomerFilters({
            fechaDesde: undefined,
            fechaHasta: undefined,
        });
    };

    const activeFiltersCount = [
        customerFilters.fechaDesde,
        customerFilters.fechaHasta
    ].filter(Boolean).length;

    return (
        <div className="flex flex-wrap items-center gap-2 mb-4">

            {/* Fechas de Registro */}
            <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground mr-1">Registrado:</span>
                <div className="relative">
                    <Input
                        type="date"
                        className="w-auto h-9"
                        placeholder="Desde"
                        value={customerFilters.fechaDesde || ''}
                        onChange={(e) => setCustomerFilters({ fechaDesde: e.target.value })}
                    />
                </div>
                <span className="text-muted-foreground">-</span>
                <div className="relative">
                    <Input
                        type="date"
                        className="w-auto h-9"
                        placeholder="Hasta"
                        value={customerFilters.fechaHasta || ''}
                        onChange={(e) => setCustomerFilters({ fechaHasta: e.target.value })}
                    />
                </div>
            </div>

            {/* Botón Limpiar */}
            {activeFiltersCount > 0 && (
                <Button
                    variant="ghost"
                    onClick={clearFilters}
                    className="h-9 px-2 lg:px-3"
                >
                    <X className="mr-2 h-4 w-4" />
                    Limpiar
                </Button>
            )}
        </div>
    );
}
