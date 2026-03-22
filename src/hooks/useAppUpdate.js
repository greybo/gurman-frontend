import { useState, useEffect } from 'react';
import { database, storage } from '../firebase';
import { ref, onValue, set } from 'firebase/database';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { appUpdateDbPath } from '../PathDb';
console.log('[AppUpdate] Storage bucket:', storage?.app?.options?.storageBucket);

/**
 * Extract versionName and versionCode from APK filename.
 * Supports: Gurman-alpha-5.4.0(168).apk, Gurman-release-5.5.0(170).apk, app-5.4.0(168).apk
 * Pattern: any prefix, then versionName(versionCode).apk
 */
function parseApkFilename(filename) {
  // Match: versionName(versionCode).apk at the end
  const match = filename.match(/(\d+\.\d+(?:\.\d+)?)\((\d+)\)\.apk$/i);
  if (match) {
    return { versionName: match[1], versionCode: match[2] };
  }
  return null;
}

const EMPTY_UPDATE = {
  versionCode: '',
  versionName: '',
  apkUrl: '',
  updateType: 'soft',
  releaseNotes: '',
  updatedAt: 0,
};

export default function useAppUpdate() {
  const [current, setCurrent] = useState(null);
  const [previous, setPrevious] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // APK upload state
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [form, setForm] = useState({ ...EMPTY_UPDATE });

  // Load data from Firebase
  useEffect(() => {
    const currentRef = ref(database, `${appUpdateDbPath}/current`);
    const previousRef = ref(database, `${appUpdateDbPath}/previous`);

    let isFirstLoad = true;
    const unsubCurrent = onValue(currentRef, (snap) => {
      const val = snap.val();
      setCurrent(val);
      if (val && isFirstLoad) {
        setForm({
          versionCode: val.versionCode ?? '',
          versionName: val.versionName ?? '',
          apkUrl: val.apkUrl ?? '',
          updateType: val.updateType ?? 'soft',
          releaseNotes: val.releaseNotes ?? '',
          updatedAt: val.updatedAt ?? 0,
        });
        isFirstLoad = false;
      }
      setLoading(false);
    });

    const unsubPrevious = onValue(previousRef, (snap) => {
      setPrevious(snap.val());
    });

    return () => {
      unsubCurrent();
      unsubPrevious();
    };
  }, []);

  const updateFormField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError('');
    setSuccessMessage('');
  };

  // Upload APK to Firebase Storage
  const uploadApk = async (file) => {
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);
    setError('');

    // Extract version from filename (e.g. Gurman-alpha-5.4.0(168).apk)
    const parsed = parseApkFilename(file.name);
    if (parsed) {
      console.log('[AppUpdate] Extracted from filename:', parsed.versionName, '(' + parsed.versionCode + ')');
      setForm((prev) => ({
        ...prev,
        versionCode: parsed.versionCode,
        versionName: parsed.versionName,
      }));
    }

    try {
      const fileName = `apk-releases/${file.name}`;
      const fileRef = storageRef(storage, fileName);
      const metadata = { contentType: 'application/vnd.android.package-archive' };
      const uploadTask = uploadBytesResumable(fileRef, file, metadata);

      console.log('[AppUpdate] Starting upload:', file.name, 'size:', file.size);

      await new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('[AppUpdate] Progress:', Math.round(progress) + '%');
            setUploadProgress(Math.round(progress));
          },
          (err) => {
            console.error('[AppUpdate] Upload error:', err.code, err.message);
            setError(`Помилка завантаження: ${err.code} — ${err.message}`);
            reject(err);
          },
          async () => {
            console.log('[AppUpdate] Upload complete, getting URL...');
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            console.log('[AppUpdate] Download URL:', url);
            updateFormField('apkUrl', url);
            resolve();
          }
        );
      });
    } catch (e) {
      console.error('[AppUpdate] Error:', e);
      setError(`Помилка завантаження APK: ${e.code || ''} ${e.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Save current release (moves old current → previous)
  const saveRelease = async () => {
    if (!form.versionCode || !form.versionName) {
      setError('Заповніть versionCode та versionName');
      return;
    }
    if (!form.apkUrl) {
      setError('Завантажте APK файл або вкажіть URL');
      return;
    }

    setSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      // Move current → previous (if current exists)
      if (current && current.versionCode) {
        await set(ref(database, `${appUpdateDbPath}/previous`), { ...current });
      }

      // Save new current
      const data = {
        versionCode: Number(form.versionCode),
        versionName: form.versionName.trim(),
        apkUrl: form.apkUrl.trim(),
        updateType: form.updateType,
        releaseNotes: form.releaseNotes.trim(),
        updatedAt: Date.now(),
      };

      await set(ref(database, `${appUpdateDbPath}/current`), data);
      setForm({ ...EMPTY_UPDATE });
      setSuccessMessage('Реліз збережено успішно');
    } catch (e) {
      console.error(e);
      setError(`Помилка збереження: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Update previous manually
  const savePrevious = async (prevData) => {
    setSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      const data = {
        versionCode: Number(prevData.versionCode),
        versionName: prevData.versionName.trim(),
        apkUrl: prevData.apkUrl.trim(),
        updateType: prevData.updateType || 'soft',
        releaseNotes: prevData.releaseNotes?.trim() || '',
        updatedAt: prevData.updatedAt || Date.now(),
      };
      await set(ref(database, `${appUpdateDbPath}/previous`), data);
      setSuccessMessage('Previous версію збережено');
    } catch (e) {
      console.error(e);
      setError(`Помилка збереження: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Save current (edit in place, no move to previous)
  const saveCurrent = async (currentData) => {
    setSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      const data = {
        versionCode: Number(currentData.versionCode),
        versionName: currentData.versionName.trim(),
        apkUrl: currentData.apkUrl.trim(),
        updateType: currentData.updateType || 'soft',
        releaseNotes: currentData.releaseNotes?.trim() || '',
        updatedAt: currentData.updatedAt || Date.now(),
      };
      await set(ref(database, `${appUpdateDbPath}/current`), data);
      setSuccessMessage('Поточну версію оновлено');
    } catch (e) {
      console.error(e);
      setError(`Помилка збереження: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Clear current
  const clearCurrent = async () => {
    setSaving(true);
    try {
      await set(ref(database, `${appUpdateDbPath}/current`), null);
      setForm({ ...EMPTY_UPDATE });
      setSuccessMessage('Поточну версію видалено');
    } catch (e) {
      setError(`Помилка: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Clear previous
  const clearPrevious = async () => {
    setSaving(true);
    try {
      await set(ref(database, `${appUpdateDbPath}/previous`), null);
      setSuccessMessage('Previous версію видалено');
    } catch (e) {
      setError(`Помилка: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  return {
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
    saveCurrent,
    clearCurrent,
    savePrevious,
    clearPrevious,
  };
}
