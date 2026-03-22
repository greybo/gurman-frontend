import React, { useState, useRef } from 'react';
import {
  Save,
  Upload,
  Package,
  Hash,
  Tag,
  FileText,
  Link,
  Shield,
  Clock,
  RotateCcw,
  Trash2,
  CheckCircle,
  AlertCircle,
  Plus,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export default function AppUpdateSettings({
  current,
  previous,
  form,
  updateFormField,
  loading,
  saving,
  error,
  successMessage,
  uploadProgress,
  uploading,
  uploadApk,
  saveRelease,
  savePrevious,
  clearPrevious,
}) {
  const fileInputRef = useRef(null);
  const [showReleaseForm, setShowReleaseForm] = useState(!current);
  const [showPreviousEditor, setShowPreviousEditor] = useState(false);
  const [prevForm, setPrevForm] = useState({
    versionCode: '',
    versionName: '',
    apkUrl: '',
    updateType: 'soft',
    releaseNotes: '',
  });

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      uploadApk(file);
    } else if (file) {
      alert('Файл не вибрано');
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const d = new Date(timestamp);
    const pad = (n) => n.toString().padStart(2, '0');
    return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const openPreviousEditor = () => {
    if (previous) {
      setPrevForm({
        versionCode: previous.versionCode ?? '',
        versionName: previous.versionName ?? '',
        apkUrl: previous.apkUrl ?? '',
        updateType: previous.updateType ?? 'soft',
        releaseNotes: previous.releaseNotes ?? '',
      });
    }
    setShowPreviousEditor(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
      </div>
    );
  }

  const inputClass =
    'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors';

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Update App</h2>
          <p className="text-gray-500 text-sm mt-0.5">
            Керуйте версіями мобільного додатку
          </p>
        </div>
        {showReleaseForm ? (
          <button
            className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            onClick={async () => {
              const ok = await saveRelease();
              if (ok) setShowReleaseForm(false);
            }}
            disabled={saving || uploading}
          >
            <Save size={16} />
            {saving ? 'Збереження...' : 'Опублікувати реліз'}
          </button>
        ) : (
          <button
            className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            onClick={() => setShowReleaseForm(true)}
          >
            <Plus size={16} />
            Додати реліз
          </button>
        )}
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}
      {successMessage && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5 text-green-700 text-sm flex items-center gap-2">
          <CheckCircle size={16} />
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Release Form */}
        <div>
          {showReleaseForm && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Package size={16} className="text-brand-600" />
                Новий реліз (current)
              </h3>
              <button
                className="text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => setShowReleaseForm(false)}
                title="Згорнути"
              >
                <ChevronUp size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Version Code */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                  <Hash size={14} className="text-gray-400" />
                  Version Code
                </label>
                <input
                  type="number"
                  className={inputClass}
                  placeholder="169"
                  value={form.versionCode}
                  onChange={(e) => updateFormField('versionCode', e.target.value)}
                />
              </div>

              {/* Version Name */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                  <Tag size={14} className="text-gray-400" />
                  Version Name
                </label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="5.5.0"
                  value={form.versionName}
                  onChange={(e) => updateFormField('versionName', e.target.value)}
                />
              </div>

              {/* Update Type */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                  <Shield size={14} className="text-gray-400" />
                  Тип оновлення
                </label>
                <div className="flex gap-3 mt-1">
                  <label
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 cursor-pointer transition-all text-sm font-medium ${
                      form.updateType === 'soft'
                        ? 'border-brand-500 bg-brand-50 text-brand-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="updateType"
                      value="soft"
                      checked={form.updateType === 'soft'}
                      onChange={() => updateFormField('updateType', 'soft')}
                      className="sr-only"
                    />
                    Soft
                  </label>
                  <label
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 cursor-pointer transition-all text-sm font-medium ${
                      form.updateType === 'force'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="updateType"
                      value="force"
                      checked={form.updateType === 'force'}
                      onChange={() => updateFormField('updateType', 'force')}
                      className="sr-only"
                    />
                    Force
                  </label>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {form.updateType === 'force'
                    ? 'Блокуючий діалог — користувач не зможе працювати без оновлення'
                    : 'М\'яке нагадування — можна відхилити та працювати далі'}
                </p>
              </div>

              {/* Release Notes */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                  <FileText size={14} className="text-gray-400" />
                  Release Notes
                </label>
                <textarea
                  className={`${inputClass} resize-none`}
                  rows={3}
                  placeholder="Опис змін у цій версії..."
                  value={form.releaseNotes}
                  onChange={(e) => updateFormField('releaseNotes', e.target.value)}
                />
              </div>

              {/* APK Upload */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                  <Upload size={14} className="text-gray-400" />
                  APK файл
                </label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".apk,application/vnd.android.package-archive,*/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button
                    className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <Upload size={14} />
                    {uploading ? `Завантаження ${uploadProgress}%` : 'Вибрати APK'}
                  </button>
                </div>
                {uploading && (
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-brand-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
              </div>

              {/* APK URL */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                  <Link size={14} className="text-gray-400" />
                  APK URL
                </label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="https://firebasestorage.googleapis.com/..."
                  value={form.apkUrl}
                  onChange={(e) => updateFormField('apkUrl', e.target.value)}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Заповнюється автоматично після завантаження APK, або вставте URL вручну
                </p>
              </div>
            </div>
          </div>
          )}
        </div>

        {/* Right: Current + Previous info */}
        <div className="space-y-6">
          {/* Current Version Card */}
          {current && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Package size={16} className="text-green-600" />
                Поточна версія (current)
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Version</span>
                  <span className="font-medium text-gray-900">
                    v{current.versionName} ({current.versionCode})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Тип</span>
                  <span
                    className={`font-medium px-2 py-0.5 rounded-full text-xs ${
                      current.updateType === 'force'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {current.updateType}
                  </span>
                </div>
                {current.releaseNotes && (
                  <div className="pt-2 border-t border-gray-100">
                    <span className="text-gray-500 text-xs">Release Notes:</span>
                    <p className="text-gray-700 mt-0.5">{current.releaseNotes}</p>
                  </div>
                )}
                {current.updatedAt && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 pt-1">
                    <Clock size={12} />
                    {formatDate(current.updatedAt)}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Previous Version Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <RotateCcw size={16} className="text-orange-500" />
                Попередня версія (previous)
              </h3>
              <div className="flex gap-2">
                <button
                  className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                  onClick={openPreviousEditor}
                >
                  {previous ? 'Редагувати' : 'Додати'}
                </button>
                {previous && (
                  <button
                    className="text-xs text-red-500 hover:text-red-700 font-medium"
                    onClick={() => {
                      if (window.confirm('Видалити previous версію?')) clearPrevious();
                    }}
                  >
                    Видалити
                  </button>
                )}
              </div>
            </div>

            {previous ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Version</span>
                  <span className="font-medium text-gray-900">
                    v{previous.versionName} ({previous.versionCode})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">APK URL</span>
                  <span className="text-gray-700 text-xs truncate max-w-[200px]" title={previous.apkUrl}>
                    {previous.apkUrl ? '...' + previous.apkUrl.slice(-40) : '—'}
                  </span>
                </div>
                {previous.updatedAt && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 pt-1">
                    <Clock size={12} />
                    {formatDate(previous.updatedAt)}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-400">
                Немає попередньої версії. Буде створена автоматично при публікації нового релізу.
              </p>
            )}

            {/* Previous Editor */}
            {showPreviousEditor && (
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Version Code</label>
                    <input
                      type="number"
                      className={inputClass}
                      value={prevForm.versionCode}
                      onChange={(e) => setPrevForm({ ...prevForm, versionCode: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Version Name</label>
                    <input
                      type="text"
                      className={inputClass}
                      value={prevForm.versionName}
                      onChange={(e) => setPrevForm({ ...prevForm, versionName: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">APK URL</label>
                  <input
                    type="text"
                    className={inputClass}
                    value={prevForm.apkUrl}
                    onChange={(e) => setPrevForm({ ...prevForm, apkUrl: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Release Notes</label>
                  <textarea
                    className={`${inputClass} resize-none`}
                    rows={2}
                    value={prevForm.releaseNotes}
                    onChange={(e) => setPrevForm({ ...prevForm, releaseNotes: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                    onClick={() => {
                      savePrevious(prevForm);
                      setShowPreviousEditor(false);
                    }}
                    disabled={saving}
                  >
                    Зберегти
                  </button>
                  <button
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm"
                    onClick={() => setShowPreviousEditor(false)}
                  >
                    Скасувати
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
