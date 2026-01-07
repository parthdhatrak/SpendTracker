import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
    'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    {
        variants: {
            variant: {
                default: 'bg-white text-black hover:bg-zinc-200 shadow-sm',
                destructive:
                    'bg-red-900 text-red-50 hover:bg-red-900/90',
                outline:
                    'border border-zinc-800 bg-background hover:bg-zinc-800 hover:text-white text-zinc-300',
                secondary:
                    'bg-zinc-800 text-zinc-50 hover:bg-zinc-800/80',
                ghost: 'hover:bg-zinc-800 hover:text-white text-zinc-400',
                link: 'text-white underline-offset-4 hover:underline',
                emerald: 'bg-zinc-100 text-black hover:bg-white shadow-lg shadow-white/10', // Kept key for compatibility but styled monochrome
                glass: 'bg-white/5 text-white hover:bg-white/10 backdrop-blur-lg border border-white/10',
            },
            size: {
                default: 'h-10 px-4 py-2',
                sm: 'h-9 rounded-md px-3',
                lg: 'h-11 rounded-md px-8',
                icon: 'h-10 w-10',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : 'button';
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
