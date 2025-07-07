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
  ...props 
}, ref) => {
  const [editorValue, setEditorValue] = useState(value || '');

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
        {...props}
      />
    </div>
  );
});

MarkdownEditor.displayName = "MarkdownEditor";

export { MarkdownEditor };