import { useEffect, useRef, useState } from "react";
import { decodeRingtone, deleteCustomRingtone, loadCustomRingtone, saveCustomRingtone } from "../services/customRingtone";

interface CustomRingtone {
  name: string;
  buffer: AudioBuffer;
}

export function useCustomRingtone() {
  const [audio, setAudio] = useState<CustomRingtone | null>(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const loading = useRef(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const stored = await loadCustomRingtone();
        const buffer = stored ? await decodeRingtone(stored.blob) : null;
        if (!cancelled && stored && buffer) setAudio({ name: stored.name, buffer });
      } catch {
        if (!cancelled) setError("Audio tersimpan tidak bisa dimuat. Unggah ulang audio Anda.");
      } finally {
        if (!cancelled) { loading.current = false; setBusy(false); }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const upload = async (file: File): Promise<boolean> => {
    if (loading.current) return false;
    loading.current = true;
    setBusy(true);
    setError("");
    try {
      const buffer = await decodeRingtone(file);
      await saveCustomRingtone({ name: file.name, blob: file });
      setAudio({ name: file.name, buffer });
      return true;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Audio gagal diunggah.");
      return false;
    } finally {
      loading.current = false;
      setBusy(false);
    }
  };

  const remove = async (): Promise<boolean> => {
    if (loading.current) return false;
    loading.current = true;
    setBusy(true);
    setError("");
    try {
      await deleteCustomRingtone();
      setAudio(null);
      return true;
    } catch {
      setError("Audio belum berhasil dihapus. Coba lagi.");
      return false;
    } finally {
      loading.current = false;
      setBusy(false);
    }
  };

  return { audio, busy, error, upload, remove };
}

export type CustomRingtoneControls = ReturnType<typeof useCustomRingtone>;
