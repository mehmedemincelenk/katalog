import { memo, forwardRef } from 'react';
import { THEME } from '../../data/config';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  labelText?: string;
  id: string;
  containerClassName?: string;
}

const FormInput = memo(
  forwardRef<HTMLInputElement, FormInputProps>(
    (
      { labelText, id, className = '', containerClassName = '', ...props },
      ref,
    ) => (
      <div className={containerClassName}>
        {labelText && (
          <label
            htmlFor={id}
            className={THEME.addProductModal.typography.label}
          >
            {labelText}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          {...props}
          className={`${THEME.addProductModal.inputField} ${className}`}
        />
      </div>
    ),
  ),
);

export default FormInput;
