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
    <div className="page-container">
      <div className="main-wrapper">
        {/* Header with Tabs */}
        <div className="upload-card">
          <div className="upload-header">
            <div className="upload-title-wrapper">
              <FileSpreadsheet />
              <h1 className="upload-title">Excel Manager</h1>
            </div>
          </div>

          {/* Tabs Navigation */}
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
                fontFamily: 'inherit'
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
                fontFamily: 'inherit'
              }}
            >
              <FileSpreadsheet size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
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