export const CUSTOM_RINGTONE_ID = "custom";
export const MAX_AUDIO_BYTES = 5 * 1024 * 1024;

export interface StoredRingtone {
  name: string;
  blob: Blob;
}

const DATABASE = "pomodoro-audio";
const STORE = "ringtones";

async function accessRingtone<T>(mode: IDBTransactionMode, request: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const database = await new Promise<IDBDatabase>((resolve, reject) => {
    const opening = indexedDB.open(DATABASE, 1);
    opening.onupgradeneeded = () => opening.result.createObjectStore(STORE);
    opening.onsuccess = () => resolve(opening.result);
    opening.onerror = () => reject(new Error("Penyimpanan audio tidak tersedia."));
  });
  try {
    return await new Promise<T>((resolve, reject) => {
      const transaction = database.transaction(STORE, mode);
      const operation = request(transaction.objectStore(STORE));
      transaction.oncomplete = () => resolve(operation.result);
      transaction.onabort = () => reject(new Error("Audio gagal disimpan. Periksa ruang penyimpanan browser."));
      transaction.onerror = () => reject(new Error("Penyimpanan audio tidak tersedia."));
    });
  } finally {
    database.close();
  }
}

export const loadCustomRingtone = () => accessRingtone<StoredRingtone | undefined>("readonly", store => store.get(CUSTOM_RINGTONE_ID));
export const saveCustomRingtone = (ringtone: StoredRingtone) => accessRingtone("readwrite", store => store.put(ringtone, CUSTOM_RINGTONE_ID));
export const deleteCustomRingtone = () => accessRingtone("readwrite", store => store.delete(CUSTOM_RINGTONE_ID));

export async function decodeRingtone(blob: Blob): Promise<AudioBuffer> {
  if (blob.size === 0) throw new Error("File audio kosong.");
  if (blob.size > MAX_AUDIO_BYTES) throw new Error("Ukuran audio maksimal 5 MB.");
  try {
    const decoder = new OfflineAudioContext(1, 1, 44100);
    const buffer = await decoder.decodeAudioData(await blob.arrayBuffer());
    if (buffer.duration <= 0) throw new Error("Empty audio");
    return buffer;
  } catch {
    throw new Error("Audio tidak bisa dibaca. Coba MP3, WAV, atau OGG lain.");
  }
}
