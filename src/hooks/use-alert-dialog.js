'use client';

import { useState } from 'react';

export const useAlertDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({
    title: '',
    description: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    onConfirm: () => {},
    onCancel: () => {},
    variant: 'default', // 'default' | 'destructive'
  });

  const showAlert = ({
    title,
    description,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm = () => {},
    onCancel = () => {},
    variant = 'default',
  }) => {
    setConfig({
      title,
      description,
      confirmText,
      cancelText,
      onConfirm,
      onCancel,
      variant,
    });
    setIsOpen(true);
  };

  const showConfirm = ({
    title = 'Are you sure?',
    description,
    confirmText = 'Yes, continue',
    cancelText = 'Cancel',
    onConfirm = () => {},
    onCancel = () => {},
  }) => {
    showAlert({
      title,
      description,
      confirmText,
      cancelText,
      onConfirm,
      onCancel,
      variant: 'default',
    });
  };

  const showDeleteConfirm = ({
    title = 'Delete confirmation',
    description = 'This action cannot be undone.',
    confirmText = 'Delete',
    cancelText = 'Cancel',
    onConfirm = () => {},
    onCancel = () => {},
  }) => {
    showAlert({
      title,
      description,
      confirmText,
      cancelText,
      onConfirm,
      onCancel,
      variant: 'destructive',
    });
  };

  const handleConfirm = () => {
    config.onConfirm();
    setIsOpen(false);
  };

  const handleCancel = () => {
    config.onCancel();
    setIsOpen(false);
  };

  const close = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    config,
    showAlert,
    showConfirm,
    showDeleteConfirm,
    handleConfirm,
    handleCancel,
    close,
  };
};
