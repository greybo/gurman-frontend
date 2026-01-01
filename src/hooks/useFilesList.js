// src/hooks/useFilesList.js
import { useState, useEffect } from 'react';
import { API_URL } from '../config.js';

export default function useFilesList(activeTab) {
  // State
  const [files, setFiles] = useState([]);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [fileData, setFileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  // Load files list when tab becomes active
  useEffect(() => {
    if (activeTab === 'files') {
      fetchFilesList();
    }
  }, [activeTab]);

  // Fetch files list
  const fetchFilesList = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/files`);
      const result = await response.json();
      
      if (response.ok) {
        setFiles(result.files);
      } else {
        setError('Помилка завантаження списку файлів');
      }
    } catch (error) {
      console.error('Помилка:', error);
      setError('Помилка з\'єднання з сервером');
    } finally {
      setLoading(false);
    }
  };

  // Fetch specific file data
  const fetchFileData = async (fileId) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/files/${fileId}`);
      const result = await response.json();
      
      if (response.ok) {
        setFileData(result);
        setSelectedFileId(fileId);
      } else {
        setError('Помилка завантаження файлу');
      }
    } catch (error) {
      console.error('Помилка:', error);
      setError('Помилка з\'єднання з сервером');
    } finally {
      setLoading(false);
    }
  };

  // Delete file
  const deleteFile = async (fileId) => {
    if (!confirm('Ви впевнені, що хочете видалити цей файл?')) return;

    try {
      const response = await fetch(`${API_URL}/files/${fileId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setFiles(files.filter(f => f.id !== fileId));
        if (selectedFileId === fileId) {
          setFileData(null);
          setSelectedFileId(null);
        }
        alert('Файл успішно видалено');
      } else {
        alert('Помилка видалення файлу');
      }
    } catch (error) {
      console.error('Помилка:', error);
      alert('Помилка з\'єднання з сервером');
    }
  };

  // Split text into tokens for search
  const splitIntoTokens = (text) => {
    return text.toLowerCase().split(/\s+/).filter(token => token.length > 0);
  };

  // Filter file data by search term
  const filteredFileData = fileData?.rows?.filter(row => {
    if (!searchTerm.trim()) return true;
    
    const searchTokens = splitIntoTokens(searchTerm);
    const rowText = row.join(' ').toLowerCase();
    
    return searchTokens.every(token => rowText.includes(token));
  }) || [];

  // Format timestamp to readable date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Невідомо';
    const date = timestamp._seconds 
      ? new Date(timestamp._seconds * 1000) 
      : new Date(timestamp);
    return date.toLocaleString('uk-UA');
  };

  return {
    // State
    files,
    selectedFileId,
    fileData,
    loading,
    searchTerm,
    setSearchTerm,
    error,
    filteredFileData,
    
    // Methods
    fetchFilesList,
    fetchFileData,
    deleteFile,
    formatDate
  };
}