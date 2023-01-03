import { ButtonHTMLAttributes, FC } from "react";

export const Button: FC<ButtonHTMLAttributes<HTMLButtonElement>> = ({
  children,
  className,
  ...rest
}) => {
  return (
    <button
      className="flex items-center justify-center gap-4 rounded-md bg-blue-500 px-4 py-2 font-bold text-white transition-colors hover:bg-blue-800"
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
