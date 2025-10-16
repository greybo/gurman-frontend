// src/pages/ExcelParser.jsx
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, Search, X, CloudUpload, Edit2 } from 'lucide-react';

export default function ExcelParser() {
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [fileName, setFileName] = useState('');
  const [customFileName, setCustomFileName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showCustomName, setShowCustomName] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setFileName(file.name);
    setSelectedFile(file);

    // Автоматично встановлюємо назву без розширення
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

  // Генерація безпечного ID з назви
  const generateDocumentId = (name) => {
    const safeName = name
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .toLowerCase();
    const timestamp = Date.now();
    return `${safeName}_${timestamp}`;
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

    // Генеруємо custom ID з введеної назви
    // const documentId = generateDocumentId(customFileName);
    const documentId = customFileName.trim() ?? 'file_' + Date.now();
    formData.append('documentId', documentId);

    try {
      const response = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setUploadStatus(`✅ Файл успішно збережено як "${customFileName}"! ID: ${result.firestore.id}`);
        console.log('Відповідь сервера:', result);
        console.log('Firestore Document ID:', result.firestore.id);

        // Можна оновити дані з серверної відповіді
        if (result.headers && result.rows) {
          setHeaders(result.headers);
          setData(result.rows);
        }
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

  const clearData = () => {
    setData([]);
    setHeaders([]);
    setFileName('');
    setCustomFileName('');
    setSearchTerm('');
    setSelectedFile(null);
    setUploadStatus('');
    setShowCustomName(false);

    const fileInput = document.getElementById('file-upload');
    if (fileInput) fileInput.value = '';
  };

  const filteredData = data.filter(row =>
    row.some(cell =>
      cell?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="page-container">
      <div className="main-wrapper">
        <div className="upload-card">
          <div className="upload-header">
            <div className="upload-title-wrapper">
              <FileSpreadsheet />
              <h1 className="upload-title">Excel Parser</h1>
            </div>
            {fileName && (
              <button onClick={clearData} className="clear-button">
                <X />
                Очистити
              </button>
            )}
          </div>

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
              {/* Поле для введення назви */}
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
                  {/* 💡 ID документа: {customFileName ? generateDocumentId(customFileName) : '...'} */}
                  💡 ID документа: {customFileName ??  'file_' + Date.now()}
                </p>
              </div>

              {/* Кнопка завантаження */}
              <button
                onClick={handleUploadToBackend}
                disabled={uploading || !customFileName.trim()}
                className="backend-upload-button"
              >
                <CloudUpload size={20} />
                {uploading ? 'Завантаження...' : 'Зберегти на сервері'}
              </button>

              {/* Статус */}
              {uploadStatus && (
                <p className={`upload-status ${uploadStatus.includes('✅') ? 'success' : uploadStatus.includes('❌') ? 'error' : 'info'}`}>
                  {uploadStatus}
                </p>
              )}
            </div>
          )}
        </div>

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
      </div>
    </div>
  );
}