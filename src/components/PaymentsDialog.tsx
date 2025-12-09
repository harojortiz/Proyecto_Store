import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Payment } from "@/types";
import { paymentsService, CreatePaymentData } from "@/services/paymentsService";
import { formatCOP, formatDate } from "@/lib/formatters";
import { toast } from "sonner";
import { Trash2, Plus, DollarSign } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PaymentsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    saleId: string;
    saleTotal: number;
    saleDeuda: number;
    onPaymentCreated?: () => void;
}

export default function PaymentsDialog({
    open,
    onOpenChange,
    saleId,
    saleTotal,
    saleDeuda,
    onPaymentCreated,
}: PaymentsDialogProps) {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null);

    const [formData, setFormData] = useState<CreatePaymentData>({
        saleId,
        monto: 0,
        metodo: 'Efectivo',
        notas: '',
    });

    useEffect(() => {
        if (open) {
            loadPayments();
        }
    }, [open, saleId]);

    const loadPayments = async () => {
        try {
            setLoading(true);
            const data = await paymentsService.getPaymentsBySale(saleId);
            setPayments(data);
        } catch (error) {
            console.error('Error al cargar pagos:', error);
            toast.error('Error al cargar los pagos');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.monto <= 0) {
            toast.error('El monto debe ser mayor a 0');
            return;
        }

        if (formData.monto > saleDeuda) {
            toast.error(`El monto no puede ser mayor a la deuda pendiente (${formatCOP(saleDeuda)})`);
            return;
        }

        try {
            setLoading(true);
            await paymentsService.createPayment(formData);
            toast.success('Pago registrado exitosamente');
            setShowForm(false);
            setFormData({
                saleId,
                monto: 0,
                metodo: 'Efectivo',
                notas: '',
            });
            await loadPayments();
            onPaymentCreated?.();
        } catch (error: any) {
            console.error('Error al crear pago:', error);
            toast.error(error.response?.data?.error || 'Error al registrar el pago');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!paymentToDelete) return;

        try {
            setLoading(true);
            await paymentsService.deletePayment(paymentToDelete);
            toast.success('Pago eliminado exitosamente');
            setDeleteDialogOpen(false);
            setPaymentToDelete(null);
            await loadPayments();
            onPaymentCreated?.();
        } catch (error) {
            console.error('Error al eliminar pago:', error);
            toast.error('Error al eliminar el pago');
        } finally {
            setLoading(false);
        }
    };

    const totalPagado = payments.reduce((sum, p) => sum + p.monto, 0);

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Gestión de Pagos</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6">
                        {/* Resumen */}
                        <div className="grid grid-cols-3 gap-4">
                            <Card className="p-4">
                                <div className="text-sm text-muted-foreground">Total Venta</div>
                                <div className="text-2xl font-bold">{formatCOP(saleTotal)}</div>
                            </Card>
                            <Card className="p-4 bg-green-50 dark:bg-green-950">
                                <div className="text-sm text-muted-foreground">Total Pagado</div>
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    {formatCOP(totalPagado)}
                                </div>
                            </Card>
                            <Card className="p-4 bg-orange-50 dark:bg-orange-950">
                                <div className="text-sm text-muted-foreground">Deuda Pendiente</div>
                                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                    {formatCOP(saleDeuda)}
                                </div>
                            </Card>
                        </div>

                        {/* Botón agregar pago */}
                        {!showForm && saleDeuda > 0 && (
                            <Button onClick={() => setShowForm(true)} className="w-full">
                                <Plus className="w-4 h-4 mr-2" />
                                Registrar Pago
                            </Button>
                        )}

                        {/* Formulario */}
                        {showForm && (
                            <Card className="p-4">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="monto">Monto *</Label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="monto"
                                                    type="number"
                                                    step="0.01"
                                                    value={formData.monto || ''}
                                                    onChange={(e) => setFormData({ ...formData, monto: parseFloat(e.target.value) || 0 })}
                                                    className="pl-9"
                                                    placeholder="0.00"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="metodo">Método de Pago *</Label>
                                            <Select
                                                value={formData.metodo}
                                                onValueChange={(value: any) => setFormData({ ...formData, metodo: value })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Efectivo">Efectivo</SelectItem>
                                                    <SelectItem value="Transferencia">Transferencia</SelectItem>
                                                    <SelectItem value="Tarjeta">Tarjeta</SelectItem>
                                                    <SelectItem value="Otro">Otro</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="notas">Notas (Opcional)</Label>
                                        <Textarea
                                            id="notas"
                                            value={formData.notas}
                                            onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                                            placeholder="Ej: Pago parcial, Abono inicial, etc."
                                            rows={2}
                                        />
                                    </div>

                                    <div className="flex gap-2">
                                        <Button type="submit" disabled={loading}>
                                            {loading ? 'Guardando...' : 'Guardar Pago'}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setShowForm(false);
                                                setFormData({ saleId, monto: 0, metodo: 'Efectivo', notas: '' });
                                            }}
                                        >
                                            Cancelar
                                        </Button>
                                    </div>
                                </form>
                            </Card>
                        )}

                        {/* Lista de pagos */}
                        <div>
                            <h3 className="font-semibold mb-3">Historial de Pagos ({payments.length})</h3>
                            {payments.length === 0 ? (
                                <Card className="p-8 text-center text-muted-foreground">
                                    <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>No hay pagos registrados</p>
                                </Card>
                            ) : (
                                <div className="space-y-2">
                                    {payments.map((payment) => (
                                        <Card key={payment.id} className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3">
                                                        <div className="text-lg font-bold text-green-600 dark:text-green-400">
                                                            {formatCOP(payment.monto)}
                                                        </div>
                                                        <div className="text-sm px-2 py-1 bg-secondary rounded">
                                                            {payment.metodo}
                                                        </div>
                                                    </div>
                                                    <div className="text-sm text-muted-foreground mt-1">
                                                        {formatDate(payment.fecha)}
                                                    </div>
                                                    {payment.notas && (
                                                        <div className="text-sm text-muted-foreground mt-1 italic">
                                                            {payment.notas}
                                                        </div>
                                                    )}
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setPaymentToDelete(payment.id);
                                                        setDeleteDialogOpen(true);
                                                    }}
                                                >
                                                    <Trash2 className="w-4 h-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Dialog de confirmación de eliminación */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar pago?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. El pago será eliminado y la deuda de la venta será recalculada.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
