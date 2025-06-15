import React from 'react';
import PropTypes from 'prop-types';
import { TextField } from '@mui/material';

export default function Input({
  label,
  value,
  onChange,
  type = 'text',
  error,
  helperText,
  required = false,
  fullWidth = true,
  disabled = false,
  multiline = false,
  rows = 1,
  placeholder = '',
  name = '',
  autoComplete = 'off'
}) {
  return (
    <TextField
      label={label}
      value={value}
      onChange={onChange}
      type={type}
      error={error}
      helperText={helperText}
      required={required}
      fullWidth={fullWidth}
      disabled={disabled}
      multiline={multiline}
      rows={rows}
      placeholder={placeholder}
      name={name}
      autoComplete={autoComplete}
      variant="outlined"
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: 2,
          backgroundColor: 'white',
          '&:hover fieldset': {
            borderColor: '#6366F1'
          },
          '&.Mui-focused fieldset': {
            borderColor: '#6366F1'
          }
        },
        '& .MuiInputLabel-root': {
          color: '#64748B'
        },
        '& .MuiInputLabel-root.Mui-focused': {
          color: '#6366F1'
        }
      }}
    />
  );
}

Input.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  type: PropTypes.string,
  error: PropTypes.bool,
  helperText: PropTypes.string,
  required: PropTypes.bool,
  fullWidth: PropTypes.bool,
  disabled: PropTypes.bool,
  multiline: PropTypes.bool,
  rows: PropTypes.number,
  placeholder: PropTypes.string,
  name: PropTypes.string,
  autoComplete: PropTypes.string
}; 