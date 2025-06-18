interface FieldErrorData {
  field: number;
  messageCode: string;
}

interface ErrorData {
  messageCode: string;
  [key: string]: string;
}

interface AxiosResponseData {
  fieldErrors: FieldErrorData[];
  messageCode: string;
  message: string;
  errors: object;
  data: ErrorData;
  detail: string;
}

export default AxiosResponseData;
