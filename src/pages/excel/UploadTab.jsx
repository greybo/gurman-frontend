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
        <div className="flex justify-end mb-4">
          <button
            onClick={clearData}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 transition-colors"
          >
            <X size={18} />
            Очистити
          </button>
        </div>
      )}

      <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-brand-300 transition-colors">
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
          id="file-upload"
          className="hidden"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-900 font-medium mb-1">Завантажити Excel файл</p>
          <p className="text-gray-600 text-sm mb-4">Підтримуються формати: .xlsx, .xls</p>
          {fileName && (
            <p className="text-gray-700 font-medium">📄 {fileName}</p>
          )}
        </label>
      </div>

      {fileName && (
        <div className="mt-8 space-y-6">
          <div className="bg-gray-50 rounded-lg p-6">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <Edit2 size={16} />
              Назва для збереження:
            </label>
            <input
              type="text"
              value={customFileName}
              onChange={(e) => setCustomFileName(e.target.value)}
              placeholder="Введіть назву файлу..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors"
            />
            <p className="text-xs text-gray-600 mt-2">
              💡 ID документа: {customFileName || 'file_' + Date.now()}
            </p>
          </div>

          <button
            onClick={handleUploadToBackend}
            disabled={uploading || !customFileName.trim()}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CloudUpload size={20} />
            {uploading ? 'Завантаження...' : 'Зберегти на сервері'}
          </button>

          {uploadStatus && (
            <p className={`text-sm p-3 rounded-lg ${
              uploadStatus.includes('✅')
                ? 'bg-green-50 text-green-700'
                : uploadStatus.includes('❌')
                ? 'bg-red-50 text-red-700'
                : 'bg-blue-50 text-blue-700'
            }`}>
              {uploadStatus}
            </p>
          )}
        </div>
      )}

      {/* Data Preview */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 mt-8">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-brand-600 rounded-full animate-spin"></div>
          <p className="text-gray-600">Обробка файлу...</p>
        </div>
      )}

      {!loading && filteredData.length > 0 && (
        <div className="mt-8 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                Дані таблиці ({filteredData.length} рядків)
              </h2>
              <div className="relative w-64">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Пошук..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 pl-10 text-sm bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {headers.map((header, i) => (
                    <th key={i} className="px-6 py-3 text-left font-semibold text-gray-900">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, i) => (
                  <tr key={i} className="border-b border-gray-200 hover:bg-gray-50">
                    {row.map((cell, j) => (
                      <td key={j} className="px-6 py-3 text-gray-700">{cell?.toString() || '-'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredData.length === 0 && searchTerm && (
            <div className="p-6 text-center text-gray-500">
              Нічого не знайдено за запитом "{searchTerm}"
            </div>
          )}
        </div>
      )}

      {!loading && filteredData.length === 0 && !fileName && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 mt-8">
          <FileSpreadsheet size={48} className="text-gray-300" />
          <p className="text-gray-600">Завантажте Excel файл для початку роботи</p>
        </div>
      )}
    </>
  );
}