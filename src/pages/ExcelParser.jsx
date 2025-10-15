// src/pages/ExcelParser.jsx
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, Search, X } from 'lucide-react';

export default function ExcelParser() {
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [fileName, setFileName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  // const [uploadedData, setUploadedData] = useState([]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setFileName(file.name);

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

  const handleUpload = async () => {
    if (!fileName) {
      setUploadStatus('Будь ласка, виберіть файл Excel.');
      return;
    }

    setUploadStatus('Завантаження...');
    const formData = new FormData();
    formData.append('file', data);

    try {
      const response = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        body: data,
      });

      const result = await response.json(); // Читаємо відповідь у будь-якому випадку

      if (response.ok) {
        setUploadStatus('Файл успішно завантажено!');
        // setUploadedData(result.data || []);
        // setSelectedFile(null);
        // @ts-ignore
        document.getElementById('excel-file-input').value = ""; // Скидаємо значення інпуту
      } else {
        setUploadStatus(`Помилка завантаження: ${result.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Помилка мережі або сервера:', error);
      // @ts-ignore
      setUploadStatus(`Помилка: ${error.message}`);
    }
  };

  const clearData = () => {
    setData([]);
    setHeaders([]);
    setFileName('');
    setSearchTerm('');
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
          <div >
            {fileName && <p className="selected-file-name">Вибрано: {fileName}</p>}
            <button onClick={handleUpload} disabled={!fileName} className="upload-button">
              Завантажити
            </button>
            {uploadStatus && <p className="upload-status">{uploadStatus}</p>}
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