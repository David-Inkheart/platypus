import { FormControl, FormLabel, Input, FormErrorMessage, Textarea } from '@chakra-ui/react';
import { useField } from 'formik';
import React, { InputHTMLAttributes } from 'react';

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  name: string;
  label: string;
  textarea?: boolean;
};

const InputField: React.FC<InputFieldProps> = ({
  label,
  textarea,
  size: _,
  ...props
}) => {
  let InputOrTextarea = Input as any;
  if (textarea) {
    InputOrTextarea = Textarea;
  }
  const [field, {error}] = useField(props);
  return (
    <FormControl isInvalid={!!error}>
      {/* !!error is a trick to convert a string to a boolean */}
      <FormLabel htmlFor={field.name}>{label}</FormLabel>
      <InputOrTextarea
        {...field}
        {...props}
        id={field.name}
        placeholder={props.placeholder} />
        {error ?  <FormErrorMessage>{error}</FormErrorMessage> : null}
      </FormControl>
    );
};

export default InputField;