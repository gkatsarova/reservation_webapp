import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

const MotionButton = motion('button');

export default function Button({
  onClick,
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  type = 'button'
}) {
  const getStyles = () => {
    const baseStyles = {
      fontWeight: 600,
      borderRadius: 50,
      textTransform: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      outline: 'none',
      border: 'none',
      transition: 'all 0.2s ease-in-out'
    };

    const variants = {
      primary: {
        background: 'linear-gradient(135deg, #6366F1 0%, #0EA5E9 100%)',
        color: 'white',
        '&:hover': {
          background: 'linear-gradient(135deg, #4F46E5 0%, #0284C7 100%)'
        }
      },
      secondary: {
        background: 'white',
        color: '#64748B',
        border: '1px solid #E2E8F0',
        '&:hover': {
          background: '#F8FAFC'
        }
      },
      danger: {
        background: 'white',
        color: '#EF4444',
        border: '1px solid #EF4444',
        '&:hover': {
          background: '#FEE2E2'
        }
      }
    };

    const sizes = {
      small: {
        padding: '6px 16px',
        fontSize: '0.875rem'
      },
      medium: {
        padding: '8px 20px',
        fontSize: '1rem'
      },
      large: {
        padding: '12px 24px',
        fontSize: '1.125rem'
      }
    };

    return {
      ...baseStyles,
      ...variants[variant],
      ...sizes[size],
      width: fullWidth ? '100%' : 'auto',
      opacity: disabled ? 0.6 : 1,
      cursor: disabled ? 'not-allowed' : 'pointer'
    };
  };

  return (
    <MotionButton
      onClick={onClick}
      style={getStyles()}
      whileHover={!disabled && { scale: 1.05 }}
      whileTap={!disabled && { scale: 0.98 }}
      disabled={disabled}
      type={type}
    >
      {children}
    </MotionButton>
  );
}

Button.propTypes = {
  onClick: PropTypes.func,
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  fullWidth: PropTypes.bool,
  disabled: PropTypes.bool,
  type: PropTypes.oneOf(['button', 'submit', 'reset'])
}; 