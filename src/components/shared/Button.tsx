import React from "react";

export type ButtonColor = "default" | "primary" | "danger" | "ghost";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  text?: string;
  color?: ButtonColor;
};

export default function Button({ text, children, ...rest }: ButtonProps) {
  // Intentionally do not enforce any styling so callers can supply exact className
  // to keep the visual appearance identical.
  return <button {...rest}>{text ?? children}</button>;
}
