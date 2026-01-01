// src/hooks/useExcelUpload.js
import { useState } from 'react';
import * as XLSX from 'xlsx';
import { API_URL } from '../config.js';

export default function useExcelUpload() {
  // State
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [fileName, setFileName] = useState('');
  const [customFileName, setCustomFileName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploading, setUploading] = useState(false);

  // Handle file upload and parsing
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setFileName(file.name);
    setSelectedFile(file);

    // Auto-set filename without extension
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

  // Upload to backend
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
      const response = await fetch(`${API_URL}/upload`, {
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

        // Clear form after successful upload
        setTimeout(() => {
          clearData();
        }, 2000);

        return true;
      } else {
        setUploadStatus(`❌ Помилка: ${result.error || response.statusText}`);
        return false;
      }
    } catch (error) {
      console.error('Помилка мережі:', error);
      setUploadStatus(`❌ Помилка з'єднання: ${error.message}`);
      return false;
    } finally {
      setUploading(false);
    }
  };

  // Clear all data
  const clearData = () => {
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

  // Filter data by search term
  const filteredData = data.filter(row =>
    row.some(cell =>
      cell?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return {
    // State
    data,
    headers,
    fileName,
    customFileName,
    setCustomFileName,
    searchTerm,
    setSearchTerm,
    loading,
    selectedFile,
    uploadStatus,
    uploading,
    filteredData,
    
    // Methods
    handleFileUpload,
    handleUploadToBackend,
    clearData
  };
}