// src/pages/ExcelManager.jsx
import React, { useState } from 'react';
import { FileSpreadsheet, Upload } from 'lucide-react';
import useExcelUpload from '../hooks/useExcelUpload';
import useFilesList from '../hooks/useFilesList';
import UploadTab from './excel/UploadTab';
import FilesTab from './excel/FilesTab';

export default function ExcelManager() {
  // Active tab state
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'files'

  // Import hooks logic
  const uploadLogic = useExcelUpload();
  const filesLogic = useFilesList(activeTab);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <FileSpreadsheet size={32} className="text-brand-600" />
            <h1 className="text-3xl font-bold text-gray-900">Excel Manager</h1>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex gap-2 border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-2.5 rounded-t-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'upload'
                  ? 'text-brand-600 border-b-2 border-brand-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Upload size={18} />
              Завантажити файл
            </button>
            <button
              onClick={() => setActiveTab('files')}
              className={`px-4 py-2.5 rounded-t-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'files'
                  ? 'text-brand-600 border-b-2 border-brand-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileSpreadsheet size={18} />
              Мої файли ({filesLogic.files.length})
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'upload' ? (
            <UploadTab {...uploadLogic} />
          ) : (
            <FilesTab {...filesLogic} />
          )}
        </div>
      </div>
    </div>
  );
}