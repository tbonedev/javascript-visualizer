import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 hover:-translate-y-0.5 disabled:hover:translate-y-0',
  {
    variants: {
      variant: {
        default: 'bg-white text-black hover:bg-gray-100 border-0 shadow-lg hover:shadow-xl',
        destructive:
          'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-400 hover:to-rose-400 text-white shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40',
        outline:
          'border border-white/[0.08] bg-white/[0.05] hover:bg-white/[0.08] hover:border-white/[0.12] text-zinc-200 hover:shadow-lg',
        secondary:
          'bg-white/[0.08] text-zinc-200 hover:bg-white/[0.12] border border-white/[0.08]',
        ghost: 'hover:bg-white/[0.05] text-zinc-300 hover:text-zinc-100',
        link: 'text-blue-400 underline-offset-4 hover:underline hover:text-blue-300',
        opaque: 'bg-white/[0.05] text-zinc-400 border border-white/[0.08]',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-xl px-3',
        lg: 'h-11 rounded-xl px-8',
        icon: 'h-10 w-10',
        xs: 'h-7 rounded-lg px-3 text-sm',
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
