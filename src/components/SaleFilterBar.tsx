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
import { X, SlidersHorizontal, Calendar as CalendarIcon, CreditCard } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

export function SaleFilterBar() {
    const { salesFilters, setSalesFilters } = useVentasStore();

    const handleMinAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value ? parseFloat(e.target.value) : undefined;
        setSalesFilters({ minAmount: val });
    };

    const handleMaxAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value ? parseFloat(e.target.value) : undefined;
        setSalesFilters({ maxAmount: val });
    };

    const clearFilters = () => {
        setSalesFilters({
            minAmount: undefined,
            maxAmount: undefined,
            estado: undefined,
            paymentMethod: undefined,
            fechaDesde: undefined,
            fechaHasta: undefined,
        });
    };

    const activeFiltersCount = [
        salesFilters.minAmount,
        salesFilters.maxAmount,
        salesFilters.estado,
        salesFilters.paymentMethod,
        salesFilters.fechaDesde,
        salesFilters.fechaHasta
    ].filter(Boolean).length;

    return (
        <div className="flex flex-wrap items-center gap-2 mb-4">

            {/* Fechas */}
            <div className="flex items-center gap-2">
                <div className="relative">
                    <Input
                        type="date"
                        className="w-auto h-9"
                        placeholder="Desde"
                        value={salesFilters.fechaDesde || ''}
                        onChange={(e) => setSalesFilters({ fechaDesde: e.target.value })}
                    />
                </div>
                <span className="text-muted-foreground">-</span>
                <div className="relative">
                    <Input
                        type="date"
                        className="w-auto h-9"
                        placeholder="Hasta"
                        value={salesFilters.fechaHasta || ''}
                        onChange={(e) => setSalesFilters({ fechaHasta: e.target.value })}
                    />
                </div>
            </div>

            {/* Estado */}
            <Select
                value={salesFilters.estado || "todos"}
                onValueChange={(val) => setSalesFilters({ estado: val === "todos" ? undefined : val })}
            >
                <SelectTrigger className="w-[140px] h-9">
                    <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="PAGADA">Pagado</SelectItem>
                    <SelectItem value="PARCIAL">Parcial</SelectItem>
                    <SelectItem value="DEUDA">Deuda</SelectItem>
                </SelectContent>
            </Select>

            {/* Método de Pago */}
            <Select
                value={salesFilters.paymentMethod || "todos"}
                onValueChange={(val) => setSalesFilters({ paymentMethod: val === "todos" ? undefined : val })}
            >
                <SelectTrigger className="w-[160px] h-9 border-dashed">
                    <CreditCard className="mr-2 h-3 w-3 text-muted-foreground" />
                    <SelectValue placeholder="Método Pago" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="Efectivo">Efectivo</SelectItem>
                    <SelectItem value="Transferencia">Transferencia</SelectItem>
                    <SelectItem value="Tarjeta">Tarjeta</SelectItem>
                    <SelectItem value="Nequi">Nequi</SelectItem>
                    <SelectItem value="Daviplata">Daviplata</SelectItem>
                    <SelectItem value="Credito">Crédito</SelectItem>
                </SelectContent>
            </Select>

            {/* Rango de Montos */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="h-9 border-dashed">
                        <SlidersHorizontal className="mr-2 h-3 w-3" />
                        Monto
                        {(salesFilters.minAmount || salesFilters.maxAmount) && (
                            <Badge variant="secondary" className="ml-2 rounded-sm px-1 font-normal text-xs">
                                Activo
                            </Badge>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="start">
                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <h4 className="font-medium leading-none">Rango de Total Venta</h4>
                            <p className="text-xs text-muted-foreground">
                                Filtrar por valor total de la factura.
                            </p>
                        </div>
                        <div className="grid gap-2">
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label htmlFor="minAmount">Mínimo</Label>
                                <Input
                                    id="minAmount"
                                    type="number"
                                    placeholder="0"
                                    className="col-span-2 h-8"
                                    value={salesFilters.minAmount || ''}
                                    onChange={handleMinAmountChange}
                                />
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label htmlFor="maxAmount">Máximo</Label>
                                <Input
                                    id="maxAmount"
                                    type="number"
                                    placeholder="Sin límite"
                                    className="col-span-2 h-8"
                                    value={salesFilters.maxAmount || ''}
                                    onChange={handleMaxAmountChange}
                                />
                            </div>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>

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
