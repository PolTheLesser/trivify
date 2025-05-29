import React, { useContext } from 'react';
import { ThemeContext } from '../../contexts/ThemeContext';

export default function DarkModeToggle() {
  const { darkMode, setDarkMode } = useContext(ThemeContext);
  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      style={{
        padding: '0.5rem 1rem',
        borderRadius: '0.25rem',
        border: 'none',
        cursor: 'pointer',
        background: darkMode ? '#444' : '#ddd',
        color: darkMode ? '#fff' : '#000',
      }}
    >
      {darkMode ? 'Light Mode' : 'Dark Mode'}
    </button>
  );
}