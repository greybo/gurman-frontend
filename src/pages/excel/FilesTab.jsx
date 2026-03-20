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
      <div className="flex justify-end mb-4">
        <button
          onClick={fetchFilesList}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <RefreshCw size={18} />
          Оновити список
        </button>
      </div>

      {/* Files Layout */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left Panel - Files List */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="mb-4">
            <h2 className="font-bold text-gray-900">Список файлів ({files.length})</h2>
          </div>

          {loading && !fileData && (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-brand-600 rounded-full animate-spin"></div>
              <p className="text-gray-500 text-sm">Завантаження...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          {!loading && files.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <FileSpreadsheet size={48} className="text-gray-300" />
              <p className="text-gray-500 text-sm">Немає збережених файлів</p>
            </div>
          )}

          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className={`p-3 rounded-lg border transition-colors cursor-pointer flex items-center justify-between ${
                  selectedFileId === file.id
                    ? 'bg-brand-50 border-brand-200'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
                onClick={() => fetchFileData(file.id)}
              >
                <div className="flex-1 flex items-center gap-3">
                  <FileSpreadsheet size={20} className="text-gray-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <h3 className="font-medium text-gray-900 text-sm truncate">{file.fileName}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                      <span className="flex items-center gap-1">
                        <Hash size={12} />
                        {file.rowCount} рядків
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
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
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                  title="Видалити"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - File Data */}
        <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          {!fileData && !loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <FileSpreadsheet size={80} className="text-gray-300" />
              <h3 className="font-semibold text-gray-900">Виберіть файл</h3>
              <p className="text-gray-600 text-sm">Натисніть на файл у списку, щоб переглянути його дані</p>
            </div>
          )}

          {loading && fileData && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-brand-600 rounded-full animate-spin"></div>
              <p className="text-gray-600">Завантаження даних...</p>
            </div>
          )}

          {fileData && !loading && (
            <>
              <div className="mb-6 pb-6 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{fileData.fileName}</h2>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                    <span>ID: {fileData.id}</span>
                    <span>•</span>
                    <span>{fileData.rowCount} рядків</span>
                    <span>•</span>
                    <span>Завантажено: {formatDate(fileData.uploadedAt)}</span>
                  </div>
                </div>
                <div className="relative w-64">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Пошук в даних..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 pl-10 text-sm bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors"
                  />
                  {searchTerm && (
                    <button
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={() => setSearchTerm('')}
                      title="Очистити пошук"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              </div>

              <div className="text-sm text-gray-600 mb-4">
                Знайдено: {filteredFileData.length} з {fileData.rowCount} рядків
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {fileData.headers.map((header, i) => (
                        <th key={i} className="px-6 py-3 text-left font-semibold text-gray-900">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFileData.map((row, i) => (
                      <tr key={i} className="border-b border-gray-200 hover:bg-gray-50">
                        {row.map((cell, j) => (
                          <td key={j} className="px-6 py-3 text-gray-700">{cell?.toString() || '-'}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredFileData.length === 0 && searchTerm && (
                <div className="text-center text-gray-500 py-8">
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