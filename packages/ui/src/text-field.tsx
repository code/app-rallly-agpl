"use client";

import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import * as React from "react";

import type { IconProps } from "./icon";
import { Icon } from "./icon";
import { cn } from "./lib/utils";

const inputVariants = cva(
  cn(
    "focus:border-primary-400 focus-visible:ring-2 focus-visible:ring-primary-100",
    "h-9 rounded border border-input bg-gray-50 file:border-0 file:bg-transparent file:font-medium file:text-sm placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
  ),
  {
    variants: {
      size: {
        sm: "h-7 px-1 text-xs",
        md: "h-9 px-2 text-sm",
        lg: "h-12 px-3 text-lg",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

export type InputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size"
> &
  VariantProps<typeof inputVariants>;

const TextFieldInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, size, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          inputVariants({ size }),
          "group-[.text-field]:border-0 group-[.text-field]:bg-transparent group-[.text-field]:p-0 group-[.text-field]:ring-0 group-[.text-field]:ring-offset-0",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
TextFieldInput.displayName = "TextFieldInput";

interface TextFieldProps extends InputProps {
  children?: React.ReactNode;
}

const TextField = React.forwardRef<HTMLDivElement, TextFieldProps>(
  ({ className, size, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        onClick={(e) => {
          const target = e.target as HTMLElement;
          // find an input that s a direct descendant of the target
          target.querySelector("input")?.focus();
        }}
        className={cn(
          "flex items-center",
          "group text-field",
          "focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-100",
          inputVariants({ size }),
          "p-0",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
TextField.displayName = "TextField";

function TextFieldIcon(props: IconProps) {
  return (
    <div className="pointer-events-none px-2">
      <Icon {...props} />
    </div>
  );
}

export { TextField, TextFieldIcon, TextFieldInput };
