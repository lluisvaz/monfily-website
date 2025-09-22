import React, { useState } from 'react';

interface CodePreviewProps {
  className?: string;
}

const CodePreview: React.FC<CodePreviewProps> = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState('React');

  const tabs = ['React', 'Angular', 'CSS', 'Sass'];

  const codeExamples = {
    React: `import React from 'react';
class Component extends React.Component {
  render() {
    return (
      <div>
        <h1>codepunk</h1>
        <p>This is a simple React component.</p>
      </div>
    );
  }
}
export default codepunk;`,
    Angular: `import { Component } from '@angular/core';

@Component({
  selector: 'app-component',
  template: \`
    <div>
      <h1>codepunk</h1>
      <p>This is a simple Angular component.</p>
    </div>
  \`
})
export class AppComponent {
  title = 'codepunk';
}`,
    CSS: `.component {
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: #1a1a1a;
  color: white;
}

.component h1 {
  font-size: 2rem;
  color: #4ade80;
  margin-bottom: 1rem;
}

.component p {
  color: #9ca3af;
  line-height: 1.6;
}`,
    Sass: `$primary-color: #4ade80
$background-color: #1a1a1a
$text-color: #9ca3af

.component
  display: flex
  flex-direction: column
  padding: 20px
  background: $background-color
  color: white
  
  h1
    font-size: 2rem
    color: $primary-color
    margin-bottom: 1rem
  
  p
    color: $text-color
    line-height: 1.6`
  };

  const highlightCode = (code: string, language: string) => {
    const lines = code.split('\n');
    return lines.map((line, index) => {
      let highlightedLine = line;
      
      // Basic syntax highlighting
      if (language === 'React' || language === 'Angular') {
        highlightedLine = line
          .replace(/(import|export|class|extends|from|const|let|var|function|return)/g, '<span class="text-purple-400">$1</span>')
          .replace(/(React|Component|@Component)/g, '<span class="text-blue-400">$1</span>')
          .replace(/('.*?'|".*?"|\`.*?\`)/g, '<span class="text-green-400">$1</span>')
          .replace(/(render|template|selector)/g, '<span class="text-yellow-400">$1</span>')
          .replace(/(\/\/.*)/g, '<span class="text-gray-500">$1</span>');
      } else if (language === 'CSS' || language === 'Sass') {
        highlightedLine = line
          .replace(/([.#][a-zA-Z-]+)/g, '<span class="text-yellow-400">$1</span>')
          .replace(/(display|flex-direction|padding|background|color|font-size|margin-bottom|line-height)/g, '<span class="text-blue-400">$1</span>')
          .replace(/(#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3})/g, '<span class="text-green-400">$1</span>')
          .replace(/(\$[a-zA-Z-]+)/g, '<span class="text-purple-400">$1</span>');
      }
      
      return (
        <div key={index} className="flex">
          <span className="text-gray-500 text-right w-8 mr-4 select-none">{index + 1}</span>
          <span dangerouslySetInnerHTML={{ __html: highlightedLine || '&nbsp;' }} />
        </div>
      );
    });
  };

  return (
    <div className={`bg-gray-900 ${className}`}>
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-700">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-body px-6 py-3 text-sm font-medium transition-colors duration-200 ${
                    activeTab === tab
                      ? 'bg-gray-700 text-white border-b-2 border-green-400'
                      : 'text-gray-400 hover:text-white hover:bg-gray-750'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Code Content */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <span className="text-body text-gray-400 text-sm">
                  {activeTab.toLowerCase()}.{activeTab === 'React' || activeTab === 'Angular' ? 'tsx' : activeTab.toLowerCase()}
                </span>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                <div className="space-y-1">
                  {highlightCode(codeExamples[activeTab as keyof typeof codeExamples], activeTab)}
                </div>
              </div>
            </div>

            {/* Documentation Link */}
            <div className="px-6 py-4 bg-gray-750 border-t border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-body text-gray-400 text-sm">Documentation</span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodePreview;