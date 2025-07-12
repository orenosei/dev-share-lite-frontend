'use client';

import React, { createContext, useContext } from 'react';
import { useAlertDialog } from '../hooks/use-alert-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';

const AlertDialogContext = createContext();

export const useAlertDialogContext = () => {
  const context = useContext(AlertDialogContext);
  if (!context) {
    throw new Error('useAlertDialogContext must be used within AlertDialogProvider');
  }
  return context;
};

export const AlertDialogProvider = ({ children }) => {
  const alertDialog = useAlertDialog();

  return (
    <AlertDialogContext.Provider value={alertDialog}>
      {children}
      <AlertDialog open={alertDialog.isOpen} onOpenChange={alertDialog.close}>
        <AlertDialogContent>
          <AlertDialogHeader>
            {alertDialog.config.title && (
              <AlertDialogTitle>{alertDialog.config.title}</AlertDialogTitle>
            )}
            {alertDialog.config.description && (
              <AlertDialogDescription>
                {alertDialog.config.description}
              </AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={alertDialog.handleCancel}>
              {alertDialog.config.cancelText}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={alertDialog.handleConfirm}
              className={
                alertDialog.config.variant === 'destructive' 
                  ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' 
                  : ''
              }
            >
              {alertDialog.config.confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AlertDialogContext.Provider>
  );
};
