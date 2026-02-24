import { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    color?: 'blue' | 'green' | 'orange' | 'purple' | 'gold' | 'white' | 'destructive';
}

const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    purple: 'bg-purple-500',
    gold: 'bg-accent',
    white: 'bg-white',
    destructive: 'bg-destructive',
};

export function DashboardCard({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    color = 'blue'
}: DashboardCardProps) {
    return (
        <div className="bg-white rounded-xl border border-border/50 shadow-sm p-6 hover:shadow-md transition-all duration-300 group">
            <div className="flex items-start justify-between mb-4">
                <div className="space-y-1">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{title}</h3>
                    <p className="text-2xl font-bold tracking-tight text-primary">{value}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-secondary/50 text-accent group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                </div>
            </div>

            <div className="flex items-center justify-between mt-2 pt-4 border-t border-border/30">
                {subtitle && (
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{subtitle}</p>
                )}

                {trend && (
                    <div className="flex items-center gap-1.5">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${trend.isPositive
                            ? 'bg-success/10 text-success'
                            : 'bg-destructive/10 text-destructive'
                            }`}>
                            {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
