/* eslint-disable */
import { Button } from 'antd';
import { ButtonType } from 'antd/lib/button';
import FormItem from 'antd/lib/form/FormItem';
import React, { CSSProperties, ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { selectIsSubmitting } from '@/redux/slices/formSlice';

interface SubmitButtonProps {
  name: string | ReactNode;
  type?: ButtonType;
  className?: string;
  formFieldStyle?: CSSProperties;
  buttonStyle?: CSSProperties;
  buttonClassName?: string;
  isBlock?: boolean;
  disabled?: boolean;
  loading?: boolean;
  ref?: any;
  onClick?: () => void;
}

const SubmitButton: React.ForwardRefRenderFunction<any, SubmitButtonProps> = (
  {
    name,
    type,
    className,
    formFieldStyle,
    buttonStyle,
    isBlock,
    buttonClassName,
    disabled,
    loading,
    onClick,
  },
  ref,
) => {
  const isSubmitting = useSelector(selectIsSubmitting);

  return (
    <FormItem shouldUpdate className={className} style={formFieldStyle}>
      <Button
        type={type}
        htmlType="submit"
        disabled={isSubmitting || disabled}
        loading={loading || isSubmitting}
        style={buttonStyle}
        block={isBlock}
        className={buttonClassName}
        ref={ref}
        onClick={onClick}
      >
        {name}
      </Button>
    </FormItem>
  );
};

SubmitButton.displayName = 'SubmitButton';

export default React.forwardRef(SubmitButton);
