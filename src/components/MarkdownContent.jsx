'use client';

import React from 'react';
import MDEditor from '@uiw/react-md-editor';
import { cn } from '../lib/utils';
import { useTheme } from '../contexts/ThemeContext';

const MarkdownContent = ({ content, className, ...props }) => {
  const { theme } = useTheme();
  
  if (!content) return null;

  return (
    <div 
      className={cn(
        "prose prose-gray dark:prose-invert max-w-none",
        // Ensure text color inheritance
        "[&>p]:text-inherit [&>li]:text-inherit [&>blockquote]:text-inherit",
        className
      )} 
      {...props}
    >
      <MDEditor.Markdown
        source={content}
        style={{
          backgroundColor: 'transparent',
          padding: 0,
          margin: 0,
          fontSize: 'inherit',
          color: 'inherit'
        }}
        data-color-mode={theme === 'dark' ? 'dark' : 'light'}
      />
    </div>
  );
};

export { MarkdownContent };
