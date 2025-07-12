// Helper functions for integrating ChatBot with posts and code analysis

export const createCodeAnalysisQuery = (code, language = 'javascript') => {
  return {
    type: 'code',
    code: code,
    language: language
  };
};

export const createPostAnalysisQuery = (post) => {
  return {
    type: 'post',
    title: post.title,
    content: post.content,
    tags: post.tags
  };
};

export const createGeneralQuery = (query) => {
  return {
    type: 'general',
    query: query
  };
};

// Function to extract code blocks from markdown content
export const extractCodeBlocks = (content) => {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const blocks = [];
  let match;
  
  while ((match = codeBlockRegex.exec(content)) !== null) {
    blocks.push({
      language: match[1] || 'text',
      code: match[2].trim()
    });
  }
  
  return blocks;
};

// Function to get programming language suggestions based on file extension or content
export const detectLanguage = (filename, content) => {
  if (filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const languageMap = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'sql': 'sql',
      'json': 'json',
      'xml': 'xml',
      'yaml': 'yaml',
      'yml': 'yaml'
    };
    
    if (languageMap[ext]) {
      return languageMap[ext];
    }
  }
  
  // Simple content-based detection
  if (content) {
    if (content.includes('function ') || content.includes('const ') || content.includes('let ')) {
      return 'javascript';
    }
    if (content.includes('def ') || content.includes('import ') || content.includes('print(')) {
      return 'python';
    }
    if (content.includes('public class ') || content.includes('System.out.println')) {
      return 'java';
    }
    if (content.includes('SELECT ') || content.includes('FROM ') || content.includes('WHERE ')) {
      return 'sql';
    }
  }
  
  return 'text';
};
