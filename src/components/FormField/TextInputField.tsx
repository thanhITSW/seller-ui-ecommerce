import {BaseInputFieldProps} from '@/types/common';
import {Input} from 'antd';
import FormItem from './FormItem';

const TextInputField: React.FunctionComponent<BaseInputFieldProps> = (
  props
) => {
  const {
    placeholder,
    disabled,
    value,
    suffix,
    maxLength,
    readOnly,
    uppercase,
    name,
    ...rest
  } = props;

  return (
    <FormItem name={name} {...rest}>
      <Input
        placeholder={placeholder}
        disabled={disabled}
        value={value as string}
        suffix={suffix}
        maxLength={maxLength}
        readOnly={readOnly}
        name={name}
        style={uppercase ? {textTransform: 'uppercase'} : undefined}
      />
    </FormItem>
  );
};

export default TextInputField;
