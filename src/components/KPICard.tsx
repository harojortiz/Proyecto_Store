import { Card } from "@/components/ui/card";
import { LucideIcon, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
  onClick?: () => void;
}

export default function KPICard({ title, value, subtitle, icon: Icon, variant = 'default', onClick }: KPICardProps) {
  const variants = {
    default: {
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
      gradient: 'from-primary/5 to-transparent',
    },
    success: {
      iconBg: 'bg-success/10',
      iconColor: 'text-success',
      gradient: 'from-success/5 to-transparent',
    },
    warning: {
      iconBg: 'bg-accent/10',
      iconColor: 'text-accent',
      gradient: 'from-accent/5 to-transparent',
    },
    destructive: {
      iconBg: 'bg-destructive/10',
      iconColor: 'text-destructive',
      gradient: 'from-destructive/5 to-transparent',
    },
  };

  const { iconBg, iconColor, gradient } = variants[variant];

  return (
    <Card
      className={cn(
        "relative overflow-hidden border-border/50 shadow-elegant transition-all duration-300",
        onClick && "cursor-pointer hover-lift group"
      )}
      onClick={onClick}
    >
      {/* Gradiente de fondo sutil */}
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50", gradient)} />

      <div className="relative p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              {title}
              {onClick && (
                <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </p>
            <p className="text-2xl md:text-3xl font-bold tracking-tight">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className={cn(
            "p-3 rounded-2xl transition-all duration-300",
            iconBg,
            onClick && "group-hover:scale-110"
          )}>
            <Icon className={cn("w-6 h-6", iconColor)} />
          </div>
        </div>
      </div>
    </Card>
  );
}
