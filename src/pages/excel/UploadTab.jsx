// src/pages/excel/UploadTab.jsx
import React from 'react';
import { Upload, FileSpreadsheet, Search, X, CloudUpload, Edit2 } from 'lucide-react';

export default function UploadTab({
  fileName,
  customFileName,
  setCustomFileName,
  searchTerm,
  setSearchTerm,
  loading,
  uploadStatus,
  uploading,
  filteredData,
  headers,
  handleFileUpload,
  handleUploadToBackend,
  clearData
}) {
  return (
    <>
      {fileName && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
          <button onClick={clearData} className="clear-button">
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

      {/* Data Preview */}
      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p className="loading-text">Обробка файлу...</p>
        </div>
      )}

      {!loading && filteredData.length > 0 && (
        <div className="data-card" style={{ marginTop: '24px' }}>
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

      {!loading && filteredData.length === 0 && !fileName && (
        <div className="empty-state">
          <FileSpreadsheet />
          <p>Завантажте Excel файл для початку роботи</p>
        </div>
      )}
    </>
  );
}