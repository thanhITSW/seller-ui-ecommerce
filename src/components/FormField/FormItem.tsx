/* eslint-disable */
import {useAppSelector, useErrTranslation} from '../../hooks/common';
import {BaseFormItemProps} from '@/types/common';
import {Form} from 'antd';
import React from 'react';
import {selectFieldErrors} from '../../redux/slices/formSlice';

const FormItem: React.FunctionComponent<BaseFormItemProps> = (props) => {
  const {name} = props;
  const et = useErrTranslation();
  const errors = useAppSelector(selectFieldErrors);
  const validateStatus = errors?.[name] ? 'error' : 'success';
  const help = errors?.[name] ? et(errors[name][0]) : null;

  return <Form.Item {...props} validateStatus={validateStatus} help={help} />;
};

export default FormItem;
