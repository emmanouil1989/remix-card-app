import type { ButtonHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;
export default function Button({
  onClick,
  children,
  className,
  ...props
}: ButtonProps) {
  const mergedClasses = twMerge(
    `bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded ${className}`,
  );
  return (
    <button {...props} onClick={onClick} className={mergedClasses}>
      {children}
    </button>
  );
}
