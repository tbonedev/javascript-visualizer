'use client';

import React, { useState, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';

export default function CodeEditor() {
  const [code, setCode] = useState('// Your code here');
  const [currentStep, setCurrentStep] = useState(0);
  const [executionSteps, setExecutionSteps] = useState([]);
  const editorRef = useRef(null);

  // Навигационные функции
  const handleFirst = () => setCurrentStep(0);
  const handlePrev = () => setCurrentStep(Math.max(0, currentStep - 1));
  const handleNext = () =>
    setCurrentStep(Math.min(executionSteps.length - 1, currentStep + 1));
  const handleLast = () => setCurrentStep(executionSteps.length - 1);

  const handleEdit = () => {
    // Логика для редактирования кода
    console.log('Edit mode activated');
  };

  return (
    <div className='code-stepper-container'>
      {/* Редактор кода */}
      <CodeMirror
        ref={editorRef}
        value={code}
        height='400px'
        theme={oneDark}
        extensions={[javascript({ jsx: true })]}
        onChange={(value) => setCode(value)}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          dropCursor: false,
          allowMultipleSelections: false,
          indentOnInput: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          rectangularSelection: true,
          highlightSelectionMatches: true,
          searchKeymap: true,
        }}
      />
      {/* Панель с кнопками управления
      <div className='control-panel'>
        <button onClick={handleEdit}>Edit this code</button>
        <button onClick={handleFirst}>First</button>
        <button onClick={handlePrev}>Prev</button>
        <button onClick={handleNext}>Next</button>
        <button onClick={handleLast}>Last</button>
        <span>
          Step: {currentStep + 1}/{executionSteps.length}
        </span>
      </div> */}
    </div>
  );
}
