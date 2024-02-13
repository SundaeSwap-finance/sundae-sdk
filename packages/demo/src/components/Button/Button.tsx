import cx from "classnames";
import { ButtonHTMLAttributes, FC } from "react";

import Loader from "../Loader";

export const Button: FC<
  ButtonHTMLAttributes<HTMLButtonElement> & { loading: boolean }
> = ({ children, className, loading, ...rest }) => {
  return (
    <button
      className={cx(
        "flex items-center justify-center gap-4 rounded-md bg-blue-500 px-4 py-2 font-bold text-white transition-colors hover:bg-blue-800",
        className
      )}
      {...rest}
    >
      {children}
      {loading && <Loader />}
    </button>
  );
};

export default Button;
