// src/pages/FilesListPage.jsx
import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Search, Trash2, Calendar, Hash, Download } from 'lucide-react';
import  { API_URL } from '../config.js';

export default function FilesListPage() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileData, setFileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  // Завантаження списку файлів при монтуванні компонента
  useEffect(() => {
    fetchFilesList();
  }, []);

  // Отримання списку файлів
  const fetchFilesList = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/api/files`);
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

  // Отримання конкретного файлу
  const fetchFileData = async (fileId) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/api/files/${fileId}`);
      const result = await response.json();
      
      if (response.ok) {
        setFileData(result);
        setSelectedFile(fileId);
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

  // Видалення файлу
  const deleteFile = async (fileId) => {
    if (!confirm('Ви впевнені, що хочете видалити цей файл?')) return;

    try {
      const response = await fetch(`${API_URL}/api/files/${fileId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setFiles(files.filter(f => f.id !== fileId));
        if (selectedFile === fileId) {
          setFileData(null);
          setSelectedFile(null);
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

  // Фільтрація даних по пошуку
  const filteredData = fileData?.rows?.filter(row =>
    row.some(cell =>
      cell?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  ) || [];

  // Форматування дати
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Невідомо';
    const date = timestamp._seconds 
      ? new Date(timestamp._seconds * 1000) 
      : new Date(timestamp);
    return date.toLocaleString('uk-UA');
  };

  return (
    <div className="page-container">
      <div className="files-page-header">
        <div>
          <h1 className="page-main-title">
            <FileSpreadsheet size={32} />
            Збережені файли
          </h1>
          <p className="page-subtitle">
            Переглядайте та керуйте завантаженими Excel файлами
          </p>
        </div>
        <button onClick={fetchFilesList} className="refresh-button">
          Оновити список
        </button>
      </div>

      <div className="files-layout">
        {/* Ліва панель - Список файлів */}
        <div className="files-sidebar">
          <div className="sidebar-header">
            <h2 className="sidebar-title">Список файлів ({files.length})</h2>
          </div>

          {loading && !fileData && (
            <div className="sidebar-loading">
              <div className="spinner"></div>
              <p>Завантаження...</p>
            </div>
          )}

          {error && (
            <div className="error-message">{error}</div>
          )}

          {!loading && files.length === 0 && (
            <div className="empty-sidebar">
              <FileSpreadsheet size={48} />
              <p>Немає збережених файлів</p>
            </div>
          )}

          <div className="files-list">
            {files.map((file) => (
              <div
                key={file.id}
                className={`file-item ${selectedFile === file.id ? 'active' : ''}`}
                onClick={() => fetchFileData(file.id)}
              >
                <div className="file-item-content">
                  <FileSpreadsheet size={20} className="file-icon" />
                  <div className="file-info">
                    <h3 className="file-name">{file.fileName}</h3>
                    <div className="file-meta">
                      <span className="file-meta-item">
                        <Hash size={14} />
                        {file.rowCount} рядків
                      </span>
                      <span className="file-meta-item">
                        <Calendar size={14} />
                        {formatDate(file.uploadedAt)}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteFile(file.id);
                  }}
                  className="delete-icon-button"
                  title="Видалити"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Права панель - Дані файлу */}
        <div className="files-content">
          {!fileData && !loading && (
            <div className="empty-content">
              <FileSpreadsheet size={80} />
              <h3>Виберіть файл</h3>
              <p>Натисніть на файл у списку, щоб переглянути його дані</p>
            </div>
          )}

          {loading && fileData && (
            <div className="content-loading">
              <div className="spinner"></div>
              <p>Завантаження даних...</p>
            </div>
          )}

          {fileData && !loading && (
            <>
              <div className="content-header">
                <div>
                  <h2 className="content-title">{fileData.fileName}</h2>
                  <div className="content-meta">
                    <span>ID: {fileData.id}</span>
                    <span>•</span>
                    <span>{fileData.rowCount} рядків</span>
                    <span>•</span>
                    <span>Завантажено: {formatDate(fileData.uploadedAt)}</span>
                  </div>
                </div>
                <div className="search-wrapper">
                  <Search className="search-icon" />
                  <input
                    type="text"
                    placeholder="Пошук в даних..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>
              </div>

              <div className="data-info">
                Знайдено: {filteredData.length} з {fileData.rowCount} рядків
              </div>

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      {fileData.headers.map((header, i) => (
                        <th key={i}>{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((row, i) => (
                      <tr key={i}>
                        {row.map((cell, j) => (
                          <td key={j}>{cell?.toString() || '-'}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredData.length === 0 && searchTerm && (
                <div className="no-results">
                  Нічого не знайдено за запитом "{searchTerm}"
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}