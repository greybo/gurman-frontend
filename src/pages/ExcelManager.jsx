// src/pages/ExcelManager.jsx
import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { 
  Upload, FileSpreadsheet, Search, X, CloudUpload, Edit2,
  Trash2, Calendar, Hash, Download, RefreshCw
} from 'lucide-react';
import { API_URL } from '../config.js';

export default function ExcelManager() {
  // Стан для вкладок
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' або 'files'

  // === Стани для завантаження файлів (ExcelParser) ===
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [fileName, setFileName] = useState('');
  const [customFileName, setCustomFileName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploading, setUploading] = useState(false);

  // === Стани для списку файлів (FilesListPage) ===
  const [files, setFiles] = useState([]);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [fileData, setFileData] = useState(null);
  const [filesLoading, setFilesLoading] = useState(false);
  const [filesSearchTerm, setFilesSearchTerm] = useState('');
  const [error, setError] = useState('');

  // Завантаження списку файлів при переключенні на вкладку "Мої файли"
  useEffect(() => {
    if (activeTab === 'files') {
      fetchFilesList();
    }
  }, [activeTab]);

  // === Функції для завантаження файлів (ExcelParser) ===
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setFileName(file.name);
    setSelectedFile(file);

    const nameWithoutExt = file.name.replace(/\.(xlsx|xls)$/i, '');
    setCustomFileName(nameWithoutExt);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1 });

        if (jsonData.length > 0) {
          setHeaders(jsonData[0]);
          setData(jsonData.slice(1));
        }
      } catch (error) {
        console.error('Помилка парсингу:', error);
        alert('Помилка при читанні файлу');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleUploadToBackend = async () => {
    if (!selectedFile) {
      setUploadStatus('❌ Будь ласка, виберіть файл Excel.');
      return;
    }

    if (!customFileName.trim()) {
      setUploadStatus('❌ Будь ласка, введіть назву файлу.');
      return;
    }

    setUploading(true);
    setUploadStatus('⏳ Завантаження на сервер...');

    const formData = new FormData();
    formData.append('file', selectedFile);

    const documentId = customFileName.trim() ?? 'file_' + Date.now();
    formData.append('documentId', documentId);

    try {
      const response = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setUploadStatus(`✅ Файл успішно збережено як "${customFileName}"! ID: ${result.firestore.id}`);
        console.log('Відповідь сервера:', result);

        if (result.headers && result.rows) {
          setHeaders(result.headers);
          setData(result.rows);
        }

        // Очищуємо форму після успішного завантаження
        setTimeout(() => {
          clearUploadData();
        }, 2000);
      } else {
        setUploadStatus(`❌ Помилка: ${result.error || response.statusText}`);
      }
    } catch (error) {
      console.error('Помилка мережі:', error);
      setUploadStatus(`❌ Помилка з'єднання: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const clearUploadData = () => {
    setData([]);
    setHeaders([]);
    setFileName('');
    setCustomFileName('');
    setSearchTerm('');
    setSelectedFile(null);
    setUploadStatus('');

    const fileInput = document.getElementById('file-upload');
    if (fileInput) fileInput.value = '';
  };

  const filteredData = data.filter(row =>
    row.some(cell =>
      cell?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // === Функції для списку файлів (FilesListPage) ===
  const fetchFilesList = async () => {
    setFilesLoading(true);
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
      setFilesLoading(false);
    }
  };

  const fetchFileData = async (fileId) => {
    setFilesLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/api/files/${fileId}`);
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
      setFilesLoading(false);
    }
  };

  const deleteFile = async (fileId) => {
    if (!confirm('Ви впевнені, що хочете видалити цей файл?')) return;

    try {
      const response = await fetch(`${API_URL}/api/files/${fileId}`, {
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

  const splitIntoTokens = (text) => {
    return text.toLowerCase().split(/\s+/).filter(token => token.length > 0);
  };

  const filteredFileData = fileData?.rows?.filter(row => {
    if (!filesSearchTerm.trim()) return true;
    
    const searchTokens = splitIntoTokens(filesSearchTerm);
    const rowText = row.join(' ').toLowerCase();
    
    return searchTokens.every(token => rowText.includes(token));
  }) || [];

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Невідомо';
    const date = timestamp._seconds 
      ? new Date(timestamp._seconds * 1000) 
      : new Date(timestamp);
    return date.toLocaleString('uk-UA');
  };

  return (
    <div className="page-container">
      <div className="main-wrapper">
        {/* Header з вкладками */}
        <div className="upload-card">
          <div className="upload-header">
            <div className="upload-title-wrapper">
              <FileSpreadsheet />
              <h1 className="upload-title">Excel Manager</h1>
            </div>
          </div>

          {/* Вкладки */}
          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            marginBottom: '24px',
            borderBottom: '2px solid #e5e7eb',
            paddingBottom: '0'
          }}>
            <button
              onClick={() => setActiveTab('upload')}
              style={{
                padding: '12px 24px',
                background: activeTab === 'upload' ? '#5b5fc7' : 'transparent',
                color: activeTab === 'upload' ? 'white' : '#6b7280',
                border: 'none',
                borderBottom: activeTab === 'upload' ? '3px solid #5b5fc7' : '3px solid transparent',
                borderRadius: '8px 8px 0 0',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <Upload size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
              Завантажити файл
            </button>
            <button
              onClick={() => setActiveTab('files')}
              style={{
                padding: '12px 24px',
                background: activeTab === 'files' ? '#5b5fc7' : 'transparent',
                color: activeTab === 'files' ? 'white' : '#6b7280',
                border: 'none',
                borderBottom: activeTab === 'files' ? '3px solid #5b5fc7' : '3px solid transparent',
                borderRadius: '8px 8px 0 0',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <FileSpreadsheet size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
              Мої файли ({files.length})
            </button>
          </div>

          {/* Контент для вкладки "Завантажити файл" */}
          {activeTab === 'upload' && (
            <>
              {fileName && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                  <button onClick={clearUploadData} className="clear-button">
                    <X />
                    Очистити
                  </button>
                </div>
              )}

              <div className="upload-zone">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Upload className="upload-icon" />
                  <p className="upload-text">Завантажити Excel файл</p>
                  <p className="upload-subtext">Підтримуються формати: .xlsx, .xls</p>
                  {fileName && (
                    <p className="file-name">📄 {fileName}</p>
                  )}
                </label>
              </div>

              {fileName && (
                <div className="upload-actions">
                  <div className="custom-name-section">
                    <label className="custom-name-label">
                      <Edit2 size={16} />
                      Назва для збереження:
                    </label>
                    <input
                      type="text"
                      value={customFileName}
                      onChange={(e) => setCustomFileName(e.target.value)}
                      placeholder="Введіть назву файлу..."
                      className="custom-name-input"
                    />
                    <p className="custom-name-hint">
                      💡 ID документа: {customFileName || 'file_' + Date.now()}
                    </p>
                  </div>

                  <button
                    onClick={handleUploadToBackend}
                    disabled={uploading || !customFileName.trim()}
                    className="backend-upload-button"
                  >
                    <CloudUpload size={20} />
                    {uploading ? 'Завантаження...' : 'Зберегти на сервері'}
                  </button>

                  {uploadStatus && (
                    <p className={`upload-status ${uploadStatus.includes('✅') ? 'success' : uploadStatus.includes('❌') ? 'error' : 'info'}`}>
                      {uploadStatus}
                    </p>
                  )}
                </div>
              )}
            </>
          )}

          {/* Контент для вкладки "Мої файли" */}
          {activeTab === 'files' && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
              <button onClick={fetchFilesList} className="refresh-button">
                <RefreshCw size={18} style={{ marginRight: '8px' }} />
                Оновити список
              </button>
            </div>
          )}
        </div>

        {/* Контент залежно від вкладки */}
        {activeTab === 'upload' ? (
          <>
            {loading && (
              <div className="loading-container">
                <div className="spinner"></div>
                <p className="loading-text">Обробка файлу...</p>
              </div>
            )}

            {!loading && data.length > 0 && (
              <div className="data-card">
                <div className="data-header">
                  <h2 className="data-title">
                    Дані таблиці ({filteredData.length} рядків)
                  </h2>
                  <div className="search-wrapper">
                    <Search className="search-icon" />
                    <input
                      type="text"
                      placeholder="Пошук..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="search-input"
                    />
                  </div>
                </div>

                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        {headers.map((header, i) => (
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
              </div>
            )}

            {!loading && data.length === 0 && (
              <div className="empty-state">
                <FileSpreadsheet />
                <p>Завантажте Excel файл для початку роботи</p>
              </div>
            )}
          </>
        ) : (
          /* Вкладка "Мої файли" */
          <div className="files-layout">
            {/* Ліва панель - Список файлів */}
            <div className="files-sidebar">
              <div className="sidebar-header">
                <h2 className="sidebar-title">Список файлів ({files.length})</h2>
              </div>

              {filesLoading && !fileData && (
                <div className="sidebar-loading">
                  <div className="spinner"></div>
                  <p>Завантаження...</p>
                </div>
              )}

              {error && (
                <div className="error-message">{error}</div>
              )}

              {!filesLoading && files.length === 0 && (
                <div className="empty-sidebar">
                  <FileSpreadsheet size={48} />
                  <p>Немає збережених файлів</p>
                </div>
              )}

              <div className="files-list">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className={`file-item ${selectedFileId === file.id ? 'active' : ''}`}
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
              {!fileData && !filesLoading && (
                <div className="empty-content">
                  <FileSpreadsheet size={80} />
                  <h3>Виберіть файл</h3>
                  <p>Натисніть на файл у списку, щоб переглянути його дані</p>
                </div>
              )}

              {filesLoading && fileData && (
                <div className="content-loading">
                  <div className="spinner"></div>
                  <p>Завантаження даних...</p>
                </div>
              )}

              {fileData && !filesLoading && (
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
                        value={filesSearchTerm}
                        onChange={(e) => setFilesSearchTerm(e.target.value)}
                        className="search-input"
                      />
                      {filesSearchTerm && (
                        <button
                          className="search-clear-button"
                          onClick={() => setFilesSearchTerm('')}
                          title="Очистити пошук"
                        >
                          <X size={18} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="data-info">
                    Знайдено: {filteredFileData.length} з {fileData.rowCount} рядків
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
                        {filteredFileData.map((row, i) => (
                          <tr key={i}>
                            {row.map((cell, j) => (
                              <td key={j}>{cell?.toString() || '-'}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {filteredFileData.length === 0 && filesSearchTerm && (
                    <div className="no-results">
                      Нічого не знайдено за запитом "{filesSearchTerm}"
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}