// src/pages/excel/FilesTab.jsx
import React from 'react';
import { 
  FileSpreadsheet, Search, Trash2, Calendar, Hash, X, RefreshCw 
} from 'lucide-react';

export default function FilesTab({
  files,
  selectedFileId,
  fileData,
  loading,
  searchTerm,
  setSearchTerm,
  error,
  filteredFileData,
  fetchFilesList,
  fetchFileData,
  deleteFile,
  formatDate
}) {
  return (
    <>
      {/* Refresh Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <button onClick={fetchFilesList} className="refresh-button">
          <RefreshCw size={18} style={{ marginRight: '8px' }} />
          Оновити список
        </button>
      </div>

      {/* Files Layout */}
      <div className="files-layout">
        {/* Left Panel - Files List */}
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

        {/* Right Panel - File Data */}
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
                  {searchTerm && (
                    <button
                      className="search-clear-button"
                      onClick={() => setSearchTerm('')}
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

              {filteredFileData.length === 0 && searchTerm && (
                <div className="no-results">
                  Нічого не знайдено за запитом "{searchTerm}"
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}