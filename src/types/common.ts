import {Rule} from 'antd/es/form';
import {FormItemProps} from 'antd/lib';
import {ChangeEvent, ReactNode} from 'react';

export interface BaseFormItemProps extends FormItemProps {
  label?: string | ReactNode;
  name: string;
  rules?: Rule[];
}

export interface BaseInputFieldProps extends BaseFormItemProps {
  placeholder?: string;
  className?: string;
  value?: string | object;
  defaultValue?: string;
  disabled?: boolean;
  suffix?: ReactNode;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  maxLength?: number;
  readOnly?: boolean;
  uppercase?: boolean;
  size?: 'large' | 'middle' | 'small';
}
