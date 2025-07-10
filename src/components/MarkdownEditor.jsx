'use client';

import React, { useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { cn } from '../lib/utils';
import { useTheme } from '../hooks';

const MarkdownEditor = React.forwardRef(({ 
  value, 
  onChange, 
  className,
  height = 400,
  preview = 'edit',
  hideToolbar = false,
  placeholder = '',
  ...props 
}, ref) => {
  const { theme } = useTheme();
  const [editorValue, setEditorValue] = useState(value || '');

  // Update internal state when value prop changes
  React.useEffect(() => {
    setEditorValue(value || '');
  }, [value]);

  const handleChange = (val) => {
    setEditorValue(val || '');
    if (onChange) {
      onChange(val || '');
    }
  };

  return (
    <div 
      className={cn("w-full max-w-none", className)} 
      ref={ref}
      data-color-mode={theme === 'dark' ? 'dark' : 'light'}
    >
      <div data-color-mode={theme === 'dark' ? 'dark' : 'light'}>
        <MDEditor
          value={editorValue}
          onChange={handleChange}
          height={height}
          preview={preview}
          hideToolbar={hideToolbar}
          data-color-mode={theme === 'dark' ? 'dark' : 'light'}
          textareaProps={{
            placeholder: placeholder,
            style: {
              fontSize: '14px',
              lineHeight: '1.5'
            }
          }}
          style={{
            backgroundColor: 'transparent',
            ...props.style
          }}
          previewOptions={{
            style: {
              backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
              color: theme === 'dark' ? '#f9fafb' : '#1f2937'
            }
          }}
          {...props}
        />
      </div>
    </div>
  );
});

MarkdownEditor.displayName = "MarkdownEditor";

export { MarkdownEditor };