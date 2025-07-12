'use client';

import { toast } from 'sonner';

export const useToast = () => {
  const showSuccess = (message, description) => {
    toast.success(message, {
      description,
      duration: 4000,
    });
  };

  const showError = (message, description) => {
    toast.error(message, {
      description,
      duration: 5000,
    });
  };

  const showWarning = (message, description) => {
    toast.warning(message, {
      description,
      duration: 4000,
    });
  };

  const showInfo = (message, description) => {
    toast.info(message, {
      description,
      duration: 3000,
    });
  };

  const showLoading = (message) => {
    return toast.loading(message);
  };

  const dismiss = (toastId) => {
    toast.dismiss(toastId);
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    dismiss,
  };
};
