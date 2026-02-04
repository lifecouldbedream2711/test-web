import React from 'react';
import TextField, { type TextFieldProps } from '@mui/material/TextField';

type InputProps = TextFieldProps;

export const Input: React.FC<InputProps> = (props) => {
  return (
    <TextField
      fullWidth
      variant="outlined"
      {...props}
    />
  );
};
