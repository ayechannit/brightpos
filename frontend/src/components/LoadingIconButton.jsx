import React, { useState } from 'react';
import { IconButton as MuiIconButton, CircularProgress } from '@mui/material';

export default function LoadingIconButton({ onClick, children, disabled, loading: externalLoading, ...props }) {
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
    <MuiIconButton
      {...props}
      onClick={handleClick}
      disabled={disabled || isLoading}
    >
      {isLoading ? <CircularProgress size={20} color="inherit" /> : children}
    </MuiIconButton>
  );
}
