import { FormControl, FormLabel, Input, FormErrorMessage } from '@chakra-ui/react';
import { FieldInputProps, useField } from 'formik';
import React, { InputHTMLAttributes } from 'react';

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  name: string;
  label: string;
  // placeholder: string;
  // type?: string;
};

const InputField: React.FC<InputFieldProps> = ({label, size: _, ...props}) => {
  const [field, {error}] = useField(props);
  return (
    <FormControl isInvalid={!!error}>
      {/* !!error is a trick to convert a string to a boolean */}
      <FormLabel htmlFor={field.name}>{label}</FormLabel>
      <Input
        {...field}
        {...props}
        id={field.name}
        placeholder={props.placeholder} />
        {error ?  <FormErrorMessage>{error}</FormErrorMessage> : null}
      </FormControl>
    );
};

export default InputField;