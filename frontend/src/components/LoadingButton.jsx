import React, { useState } from 'react';
import { Button as MuiButton, CircularProgress } from '@mui/material';

export default function LoadingButton({ onClick, children, disabled, loading: externalLoading, startIcon, ...props }) {
  const [internalLoading, setInternalLoading] = useState(false);

  const isLoading = internalLoading || externalLoading;

  const handleClick = async (e) => {
    if (!onClick) return;
    
    const result = onClick(e);
    if (result instanceof Promise) {
      setInternalLoading(true);
      try {
        await result;
      } finally {
        setInternalLoading(false);
      }
    }
  };

  return (
    <MuiButton
      {...props}
      onClick={handleClick}
      disabled={disabled || isLoading}
      startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : startIcon}
    >
      {children}
    </MuiButton>
  );
}
