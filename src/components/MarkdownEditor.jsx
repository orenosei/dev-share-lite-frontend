'use client';

import React, { useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { cn } from '../lib/utils';

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
    <div className={cn("w-full", className)} ref={ref}>
      <MDEditor
        value={editorValue}
        onChange={handleChange}
        height={height}
        preview={preview}
        hideToolbar={hideToolbar}
        data-color-mode="light"
        textareaProps={{
          placeholder: placeholder,
          style: {
            fontSize: '14px',
            lineHeight: '1.5',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }
        }}
        style={{
          backgroundColor: 'transparent',
          ...props.style
        }}
        {...props}
      />
    </div>
  );
});

MarkdownEditor.displayName = "MarkdownEditor";

export { MarkdownEditor };