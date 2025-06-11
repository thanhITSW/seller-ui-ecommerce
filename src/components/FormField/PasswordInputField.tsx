/* eslint-disable */
import { BaseInputFieldProps } from '../../types/common';
import { Input, Progress, Row, Col } from 'antd';
import { NamePath } from 'antd/lib/form/interface';
import React, { useState } from 'react';
import FormItem from './FormItem';
import { useErrTranslation } from '../../hooks/common';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import {
  PASSWORD_REGEX_LOWCASE,
  PASSWORD_REGEX_NOSPACES,
  PASSWORD_REGEX_NUMBER,
  PASSWORD_REGEX_SPECIAL,
  PASSWORD_REGEX_UPPERCASE,
} from '../../constants/common';

interface PasswordInputFieldProps extends BaseInputFieldProps {
  dependencies?: NamePath[];
  minLength?: number;
}

const PasswordInputField: React.FunctionComponent<PasswordInputFieldProps> = (props) => {
  const { placeholder, value, defaultValue, onChange, disabled, maxLength, minLength, rules } =
    props;

  const et = useErrTranslation();

  const [password, setPassword] = useState('');
  const [requirements, setRequirements] = useState({
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
    minLength: false,
    noSpaces: true,
  });

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);

    const newRequirements = {
      uppercase: PASSWORD_REGEX_UPPERCASE.test(value),
      lowercase: PASSWORD_REGEX_LOWCASE.test(value),
      number: PASSWORD_REGEX_NUMBER.test(value),
      special: PASSWORD_REGEX_SPECIAL.test(value),
      minLength: value.length >= (minLength || 8),
      noSpaces: !PASSWORD_REGEX_NOSPACES.test(value),
    };

    setRequirements(newRequirements);
    onChange && onChange(e);
  };

  const getIcon = (condition: boolean) => {
    return condition ? (
      <CheckCircleOutlined style={{ color: 'green' }} />
    ) : (
      <CloseCircleOutlined style={{ color: 'red' }} />
    );
  };

  const calculateStrength = () => {
    const { uppercase, lowercase, number, special, minLength, noSpaces } = requirements;
    const fulfilledRequirements = [uppercase, lowercase, number, special, minLength, noSpaces];
    const fulfilledCount = fulfilledRequirements.filter((item) => item).length;
    const percentage = (fulfilledCount / fulfilledRequirements.length) * 100;
    return Math.round(percentage);
  };

  const getStrengthColor = () => {
    const strength = calculateStrength();
    if (strength >= 75) return '#52c41a'; // green
    if (strength >= 50) return '#faad14'; // yellow
    if (strength >= 25) return '#fadb14'; // orange
    return '#f5222d'; // red
  };

  const progressStatus = () => {
    const strength = calculateStrength();
    if (strength === 100) return 'success';
    if (strength >= 50) return 'normal';
    if (strength >= 25) return 'active';
    return 'exception';
  };

  const updatedRules = [
    ...(rules || []),
    ...(minLength
      ? [
          {
            min: minLength,
            message:
              et('input.validation.password.minlength') +
              ` ${minLength} ` +
              et('input.validation.password.minlength2'),
          },
        ]
      : []),
  ];

  return (
    <FormItem {...props} rules={updatedRules}>
      <Input.Password
        placeholder={placeholder}
        value={value as string}
        defaultValue={defaultValue}
        onChange={handlePasswordChange}
        disabled={disabled}
        maxLength={maxLength}
      />
      {/* <div
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Progress
          percent={calculateStrength()}
          showInfo={false}
          status={progressStatus()}
          strokeColor={getStrengthColor()}
          className="password-strength"
          style={{ width: '95%', transition: 'width 0.3s, background-color 0.3s' }}
        />
      </div>
      <ul style={{ listStyle: 'none', paddingLeft: '13px' }}>
        <Row justify="space-evenly" className="password-requirements">
          <Col className="left">
            <li>
              {getIcon(requirements.uppercase)} {et('input.validation.password.uppercaseLetter')}
            </li>
            <li>
              {getIcon(requirements.lowercase)} {et('input.validation.password.lowercaseLetter')}
            </li>
            <li>
              {getIcon(requirements.number)} {et('input.validation.password.number')}
            </li>
          </Col>
          <Col className="right">
            <li>
              {getIcon(requirements.special)} {et('input.validation.password.specialCharacter')}
            </li>
            <li>
              {getIcon(requirements.minLength)} {minLength || 8}-{maxLength || 20}{' '}
              {et('input.validation.password.minlength')}
            </li>
            <li>
              {getIcon(requirements.noSpaces)} {et('input.validation.password.noSpaces')}
            </li>
          </Col>
        </Row>
      </ul> */}
    </FormItem>
  );
};

export default PasswordInputField;
