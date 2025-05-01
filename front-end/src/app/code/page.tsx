'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Editor } from '@monaco-editor/react';
import styles from './page.module.css';
import '../../styles/globals.css';

import { Interviewer } from '../../components/interviewer'

import { Tab } from '../../types/tab';
import { Question } from '../../types/question';

const CodeEditor: React.FC = () => {
  const router = useRouter();

  // menu tabs
  const tabs: Tab[] = [
    { id: 'problems', name: 'Problems', route: '/' },
    { id: 'settings', name: 'Settings', route: '/settings' },
    { id: 'tab3', name: 'tab3', route: '/tab3' },
  ];

  // questions
  const questions: Question[] = [
    {
      id: 'q1',
      title: 'Two Sum',
      description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.',
      initialCode: 'class Solution:\n\tdef twoSum(self, nums: List[int], target: int) -> List[int]:\n\t\t',
    },
    {
      id: 'q2',
      title: 'Reverse String',
      description: 'Write a function that reverses a string. The input string is given as an array of characters s.\n\nYou must do this by modifying the input array in-place with O(1) extra memory.',
      initialCode: 'class Solution:\n\tdef reverseString(self, s: List[str]) -> None:\n\t\t"""\n\t\tDo not return anything, modify s in-place instead.\n\t\t"""',
    },
  ];

  const [activeTab, setActiveTab] = useState<string>(tabs[0].id);
  const [activeQuestion, setActiveQuestion] = useState<Question>(questions[0]);
  const [code, setCode] = useState<string>(questions[0].initialCode);
  const [panelWidth, setPanelWidth] = useState(300);
  const [isDragging, setIsDragging] = useState(false);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
    }
  };

  const handleTabClick = (tab: Tab) => {
    setActiveTab(tab.id);
    router.push(tab.route);
  };

  const startDragging = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newWidth = Math.max(200, e.clientX);
        setPanelWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div className={styles.container}>      
      {/* menu tabs */}
      <div className={styles.menuTabs}>
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={`${styles.menuTab} ${activeTab === tab.id ? styles.activeTab : ''}`}
            onClick={() => handleTabClick(tab)}
          >
            <div className={styles.tabName}>{tab.name}</div>
          </div>
        ))}
      </div>

      {/* question panel */}
      <div className={styles.questionPanel} style={{ width: `${panelWidth}px` }}>
        <h2>Problems</h2>
        {questions.map(question => (
          <div
            key={question.id}
            className={`${styles.questionItem} ${activeQuestion.id === question.id ? styles.activeQuestion : ''}`}
            onClick={() => {
              setActiveQuestion(question);
              setCode(question.initialCode);
            }}
          >
            <div>{question.title}</div>
          </div>
        ))}
        
        <div className={styles.questionDetails}>
          <h3>{activeQuestion.title}</h3>
          <p>{activeQuestion.description}</p>
        </div>

        <main className="flex min-h-screen flex-col items-center justify-between p-24">
          <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
            <Interviewer
              problem={activeQuestion.description}
              currentCode={code}
            />
          </div>
        </main>
        
      </div>

      {/* resizer */}
      <div 
        className={styles.resizer}
        onMouseDown={startDragging}
      />

      {/* code editor */}
      <div className={styles.editorContainer}>
        <Editor
          height="100%"
          language="python"
          theme="vs-dark"
          value={code}
          onChange={handleEditorChange}
        />
      </div>
    </div>
  );
};

export default CodeEditor;