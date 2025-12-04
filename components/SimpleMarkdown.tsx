import React from 'react';
import { Theme } from '../types';

interface Props {
  text: string;
  theme: Theme;
}

const SimpleMarkdown: React.FC<Props> = ({ text, theme }) => {
  if (!text) return null;

  // Split logic to handle code blocks first
  const parts = text.split(/(```[\s\S]*?```)/g);

  return (
    <div className="markdown-body text-sm leading-relaxed space-y-2 break-words">
      {parts.map((part, index) => {
        if (part.startsWith('```')) {
          const content = part.replace(/^```\w*\n?/, '').replace(/```$/, '');
          return (
            <div key={index} className={`p-3 rounded-lg text-xs overflow-x-auto font-mono my-2 ${theme.codeBg}`}>
              <pre>{content}</pre>
            </div>
          );
        }

        // Inline formatting regex
        const lines = part.split('\n').map((line, lineIdx) => {
            // Check for list items
            const isList = line.trim().startsWith('- ');
            const cleanLine = isList ? line.trim().substring(2) : line;

            // Simple parser for **bold**, *italic*, `code`
            const tokens = cleanLine.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g).map((token, tIdx) => {
                if (token.startsWith('**') && token.endsWith('**')) {
                    return <strong key={tIdx} className="font-bold">{token.slice(2, -2)}</strong>;
                }
                if (token.startsWith('`') && token.endsWith('`')) {
                    return <code key={tIdx} className={`px-1 py-0.5 rounded text-[85%] ${theme.id==='night'?'bg-white/10':'bg-black/5'}`}>{token.slice(1, -1)}</code>;
                }
                if (token.startsWith('*') && token.endsWith('*')) {
                    return <em key={tIdx} className="italic">{token.slice(1, -1)}</em>;
                }
                return token;
            });

            if (isList) {
                return <div key={lineIdx} className="flex gap-2 pl-2"><span className="opacity-50">•</span><div>{tokens}</div></div>;
            }
            if (line.trim() === '') return <div key={lineIdx} className="h-2"></div>;
            
            return <div key={lineIdx} className="min-h-[1.2em]">{tokens}</div>;
        });

        return <div key={index}>{lines}</div>;
      })}
    </div>
  );
};

export default SimpleMarkdown;
