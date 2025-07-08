import { cn } from '@/lib/utils';

export default function AppLogo({ className }: { className?: string }) {
    return (
        <div className={cn('flex items-center gap-2', className)}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="text-lg font-bold">&lt;/&gt;</span>
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Tribe</span>
                <span className="truncate text-xs text-muted-foreground">Red Social Dev</span>
            </div>
        </div>
    );
}
