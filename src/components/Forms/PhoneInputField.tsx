// /* eslint-disable */
// import React, { useCallback, useEffect, useRef, useState } from 'react';
// import 'intl-tel-input/build/css/intlTelInput.css';
// import intlTelInput from 'intl-tel-input';
// import { Form } from 'antd';
// import { parsePhoneNumberFromString } from 'libphonenumber-js';
// import { useErrTranslation } from '../../hooks/common';

// interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
//   onlyCountries: string[];
//   defaultCountry?: string;
//   initialValue?: string;
//   onPhoneChange?: (value: string) => void;
//   onCountryChange?: (countryCode: string, dialCode: string) => void;
//   onValidChange?: (isValid: boolean) => void;
//   label?: string;
//   rules?: Array<{
//     required?: boolean;
//     pattern?: RegExp;
//     message: string;
//   }>;
//   maxlength?: number;
// }

// const PhoneInput: React.FC<PhoneInputProps> = ({
//   onlyCountries,
//   defaultCountry,
//   initialValue,
//   onPhoneChange,
//   onCountryChange,
//   onValidChange,
//   label,
//   rules,
//   maxlength,
//   ...props
// }) => {
//   const inputRef = useRef<HTMLInputElement>(null);
//   const itiRef = useRef<any>(null);
//   const [error, setError] = useState<string | null>(null);
//   const et = useErrTranslation();

//   const formatPhoneNumber = (value: string) => {
//     const digitsOnly = value.replace(/[^0-9]/g, '');
//     return digitsOnly.replace(/(.{3})/g, '$1 ').trim();
//   };
//   const formatValue = formatPhoneNumber(initialValue || '');
//   const [value, setValue] = useState(formatValue);

//   useEffect(() => {
//     if (formatValue) {
//       setValue(formatValue);
//     }
//   }, [formatValue]);

//   useEffect(() => {
//     if (inputRef.current) {
//       itiRef.current = intlTelInput(inputRef.current, {
//         onlyCountries,
//         separateDialCode: true,
//         initialCountry: defaultCountry,
//         utilsScript: 'https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js',
//       });

//       const handleCountryChange = () => {
//         if (inputRef.current && onCountryChange) {
//           const selectedCountry = itiRef.current.getSelectedCountryData();
//           if (selectedCountry && selectedCountry.iso2 && selectedCountry.dialCode) {
//             onCountryChange(selectedCountry.iso2, selectedCountry.dialCode);
//           }
//         }
//       };

//       inputRef.current.addEventListener('countrychange', handleCountryChange);

//       return () => {
//         if (itiRef.current) {
//           itiRef.current.destroy();
//           itiRef.current = null;
//         }

//         inputRef.current?.removeEventListener('countrychange', handleCountryChange);
//       };
//     }
//   }, [onlyCountries]);

//   const validatePhoneNumber = (value: string) => {
//     if (rules) {
//       for (const rule of rules) {
//         if (rule.required && !value) {
//           setError(rule.message);
//           onValidChange?.(false);
//           return false;
//         }
//         if (rule.pattern && !rule.pattern.test(value)) {
//           setError(rule.message);
//           onValidChange?.(false);
//           return false;
//         }
//       }
//     }

//     if (!checkValidPhoneNumber(value)) {
//       setError(et('input.validation.phone.pattern'));
//       return false;
//     }

//     setError(null);
//     onValidChange?.(true);
//     return true;
//   };

//   const checkValidPhoneNumber = (value: string) => {
//     const selectedCountry = itiRef.current.getSelectedCountryData();
//     const phoneNumber = parsePhoneNumberFromString(`+${selectedCountry.dialCode} ${value}`);
//     const isValid = phoneNumber && phoneNumber.isValid();

//     onValidChange?.(!!isValid);
//     return isValid;
//   };

//   const handleInputChange = useCallback(
//     (event: React.KeyboardEvent<HTMLInputElement>) => {
//       const rawValue = event.currentTarget.value;
//       const digitsOnly = rawValue.replace(/[^0-9]/g, '');
//       const limitedDigitsOnly = digitsOnly.substring(0, maxlength || 18);
//       const formattedValue = formatPhoneNumber(limitedDigitsOnly);

//       setValue(formattedValue);

//       validatePhoneNumber(limitedDigitsOnly);

//       if (onPhoneChange) {
//         onPhoneChange(limitedDigitsOnly);
//       }
//     },
//     [maxlength, onPhoneChange, validatePhoneNumber, formatPhoneNumber],
//   );

//   useEffect(() => {
//     if (initialValue) {
//       checkValidPhoneNumber(initialValue);
//     }
//   }, [initialValue]);

//   useEffect(() => {
//     if (inputRef.current) {
//       inputRef.current.focus();
//     }
//   }, [value]);

//   return (
//     <div className="phone-input-container">
//       <Form.Item noStyle>
//         {label && <label className="phone-input-label">{label}</label>}
//         <input
//           ref={inputRef}
//           type="tel"
//           maxLength={maxlength}
//           inputMode="numeric"
//           {...props}
//           className="custom-phone-input"
//           value={value}
//           onInput={handleInputChange}
//         />
//         {error && <span className="error-message-phone">{error}</span>}
//       </Form.Item>
//     </div>
//   );
// };

// export default PhoneInput;
