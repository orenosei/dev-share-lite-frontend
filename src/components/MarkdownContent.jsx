'use client';

import React from 'react';
import MDEditor from '@uiw/react-md-editor';
import { cn } from '../lib/utils';

const MarkdownContent = ({ content, className, ...props }) => {
  if (!content) return null;

  return (
    <div 
      className={cn("w-full markdown-content", className)} 
      {...props}
    >
      <MDEditor.Markdown
        source={content}
        style={{
          backgroundColor: 'transparent',
          padding: 0,
          margin: 0,
          fontSize: 'inherit',
          fontFamily: 'inherit',
          lineHeight: 'inherit',
          color: 'inherit'
        }}
        data-color-mode="light"
      />
    </div>
  );
};

export { MarkdownContent };
