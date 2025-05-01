'use client'

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import styles from '../../styles/page.module.css';
import '../../styles/globals.css';

interface Tab {
  id: string;
  name: string;
  route: string;
}

const CodeEditor: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname()

  // menu tabs
  const tabs: Tab[] = [
    { id: 'problems', name: 'Problems', route: '..' },
    { id: 'settings', name: 'Settings', route: '/settings' },
    { id: 'tab3', name: 'tab3', route: '/tab3' },
  ];

  const [activeTab, setActiveTab] = useState<string>(tabs[0].id);

  const handleTabClick = (tab: Tab) => {
    setActiveTab(tab.id);
    router.push(tab.route);
  };

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
      <p>{pathname}</p>
    </div>
  );
};

export default CodeEditor;