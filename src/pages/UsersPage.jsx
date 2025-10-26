// src/pages/UsersPage.jsx
import React, { useState, useEffect } from 'react';
import { database } from '../firebase';
import { ref, onValue, update } from 'firebase/database';
import { 
  Users, Hash, CheckCircle, AlertTriangle, Save, RefreshCw, 
  Mail, FileText, Package, Boxes, SearchCode 
} from 'lucide-react';

// Використовуємо той самий префікс, що й в AnalyticsPage
const prefixPath = import.meta.env.VITE_FIREBASE_DB_PREFIX || 'release';

export default function UsersPage() {
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState({});

  const fetchUsers = () => {
    setLoading(true);
    setError('');
    const usersRef = ref(database, `${prefixPath}/tg_user_db`);
    
    onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setUsers(data);
      } else {
        setUsers({});
        setError('Користувачів не знайдено');
      }
      setLoading(false);
    }, (err) => {
      console.error('Помилка завантаження:', err);
      setError('Помилка завантаження даних');
      setLoading(false);
    }, { onlyOnce: true }); 
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInputChange = (chatId, field, value) => {
    setUsers(prevUsers => ({
      ...prevUsers,
      [chatId]: {
        ...prevUsers[chatId],
        [field]: value
      }
    }));
  };

  const handleCheckboxChange = (chatId, field, checked) => {
    setUsers(prevUsers => ({
      ...prevUsers,
      [chatId]: {
        ...prevUsers[chatId],
        [field]: checked
      }
    }));
  };

  const handleSave = async (chatId) => {
    setIsSaving(prev => ({ ...prev, [chatId]: true }));
    
    const userToSave = users[chatId];
    const userRef = ref(database, `${prefixPath}/tg_user_db/${chatId}`);
    
    try {
      // Оновлюємо всі поля, які редагуються
      await update(userRef, {
        name: userToSave.name || 'n/a',
        addedToList: userToSave.addedToList || false,
        sendErrorMessage: userToSave.sendErrorMessage || false,
        // Додаємо нові поля до збереження
        invoice: userToSave.invoice || false,
        orderAll: userToSave.orderAll || false,
        volumeAndParams: userToSave.volumeAndParams || false,
        searchCode: userToSave.searchCode || false,
        // email не зберігаємо, оскільки він не редагується
      });
    } catch (err) {
      console.error('Помилка збереження:', err);
      alert(`Помилка збереження для ${chatId}`);
    } finally {
      setIsSaving(prev => ({ ...prev, [chatId]: false }));
    }
  };

  const usersList = Object.entries(users);

  // Стиль для чекбоксів
  const checkboxStyle = { 
    width: '20px', 
    height: '20px', 
    cursor: 'pointer',
    accentColor: '#5b5fc7' // Робить галочку фіолетовою
  };

  return (
    <div className="page-container">
      <div className="analytics-header">
        <div className="analytics-title-section">
          <Users size={32} className="analytics-icon" />
          <div>
            <h1 className="analytics-title">Керування TG користувачами</h1>
            <p className="analytics-subtitle">Список користувачів з `release/tg_user_db`</p>
          </div>
        </div>
        <button onClick={fetchUsers} className="refresh-button" disabled={loading}>
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Оновити список
        </button>
      </div>

      {/* Статистика (без змін) */}
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-value">{usersList.length}</div>
          <div className="stat-label">Всього користувачів</div>
        </div>
        <div className="stat-card success">
          <div className="stat-value">{usersList.filter(([, u]) => u.addedToList).length}</div>
          <div className="stat-label">Added To List</div>
        </div>
        <div className="stat-card error">
          <div className="stat-value">{usersList.filter(([, u]) => u.sendErrorMessage).length}</div>
          <div className="stat-label">Send Error</div>
        </div>
      </div>

      <div className="data-card">
        <div className="data-header">
          <h2 className="data-title">
            Список користувачів ({usersList.length})
          </h2>
        </div>

        {loading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p className="loading-text">Завантаження користувачів...</p>
          </div>
        )}
        
        {error && (
          <div className="error-message" style={{ margin: 0 }}>{error}</div>
        )}

        {!loading && !error && usersList.length > 0 && (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  {/* Додаємо хелпери для іконок */}
                  <th title="Chat ID"><div className="th-icon"><Hash size={16} /> Chat ID</div></th>
                  <th title="Name"><div className="th-icon"><Users size={16} /> Name</div></th>
                  <th title="Email"><div className="th-icon"><Mail size={16} /> Email</div></th>
                  <th title="Added to List"><div className="th-icon"><CheckCircle size={16} /> Added</div></th>
                  <th title="Send Error Msg"><div className="th-icon"><AlertTriangle size={16} /> Error</div></th>
                  <th title="Invoice"><div className="th-icon"><FileText size={16} /> Invoice</div></th>
                  <th title="Order All"><div className="th-icon"><Package size={16} /> Order All</div></th>
                  <th title="Volume & Params"><div className="th-icon"><Boxes size={16} /> Volume</div></th>
                  <th title="Search Code"><div className="th-icon"><SearchCode size={16} /> Search</div></th>
                  <th><div className="th-icon"><Save size={16} /> Дії</div></th>
                </tr>
              </thead>
              <tbody>
                {usersList.map(([chatId, user]) => (
                  <tr key={chatId}>
                    {/* Chat ID */}
                    <td>{user.chatId}</td>
                    
                    {/* Name (Input) */}
                    <td>
                      <input
                        type="text"
                        value={user.name || ''}
                        onChange={(e) => handleInputChange(chatId, 'name', e.target.value)}
                        placeholder="n/a"
                        className="form-input"
                        style={{ padding: '8px 12px', fontSize: '14px', minWidth: '150px' }}
                      />
                    </td>
                    
                    {/* Email (Read-only) */}
                    <td style={{ fontSize: '14px', color: '#6b7280' }}>
                      {user.email || 'n/a'}
                    </td>
                    
                    {/* Added to List (Checkbox) */}
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={!!user.addedToList}
                        onChange={(e) => handleCheckboxChange(chatId, 'addedToList', e.target.checked)}
                        style={checkboxStyle}
                      />
                    </td>
                    
                    {/* Send Error Msg (Checkbox) */}
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={!!user.sendErrorMessage}
                        onChange={(e) => handleCheckboxChange(chatId, 'sendErrorMessage', e.target.checked)}
                        style={checkboxStyle}
                      />
                    </td>

                    {/* Invoice (Checkbox) */}
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={!!user.invoice}
                        onChange={(e) => handleCheckboxChange(chatId, 'invoice', e.target.checked)}
                        style={checkboxStyle}
                      />
                    </td>
                    
                    {/* orderAll (Checkbox) */}
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={!!user.orderAll}
                        onChange={(e) => handleCheckboxChange(chatId, 'orderAll', e.target.checked)}
                        style={checkboxStyle}
                      />
                    </td>
                    
                    {/* volumeAndParams (Checkbox) */}
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={!!user.volumeAndParams}
                        onChange={(e) => handleCheckboxChange(chatId, 'volumeAndParams', e.target.checked)}
                        style={checkboxStyle}
                      />
                    </td>
                    
                    {/* searchCode (Checkbox) */}
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={!!user.searchCode}
                        onChange={(e) => handleCheckboxChange(chatId, 'searchCode', e.target.checked)}
                        style={checkboxStyle}
                      />
                    </td>
                    
                    {/* Save Button */}
                    <td>
                      <button
                        onClick={() => handleSave(chatId)}
                        className="backend-upload-button"
                        style={{ padding: '8px 16px', fontSize: '13px', margin: 0, boxShadow: 'none' }}
                        disabled={isSaving[chatId]}
                      >
                        {isSaving[chatId] ? (
                          <RefreshCw size={16} className="animate-spin" />
                        ) : (
                          <Save size={16} />
                        )}
                        {isSaving[chatId] ? '...' : 'Зберегти'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {!loading && usersList.length === 0 && !error && (
          <div className="no-results">
            Дані відсутні в базі.
          </div>
        )}
      </div>
    </div>
  );
}

// Додамо трохи стилів для іконок в заголовках, щоб було охайніше
// Додайте це до вашого файлу index.css

/*
.th-icon {
  display: flex;
  align-items: center;
  gap: 8px;
}
*/