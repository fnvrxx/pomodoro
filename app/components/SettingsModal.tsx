import { useState } from "react";
import type { FormEvent } from "react";
import { Play } from "lucide-react";
import type { TimerSettings } from "../types";
import { RINGTONES, playRingRepeated } from "../data/ringtones";
import { AppDialog } from "./AppDialog";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: TimerSettings;
  onSave: (settings: TimerSettings) => void;
  ringtoneId: string;
  onRingtoneChange: (id: string) => void;
  ringtoneRepeat: number;
  onRingtoneRepeatChange: (count: number) => void;
}

const FIELDS: { key: keyof TimerSettings; label: string; max: number; hint: string }[] = [
  { key: "focusDuration", label: "Fokus", max: 60, hint: "menit" },
  { key: "breakDuration", label: "Istirahat", max: 30, hint: "menit" },
  { key: "longBreakDuration", label: "Istirahat panjang", max: 60, hint: "menit" },
  { key: "longBreakInterval", label: "Istirahat panjang setelah", max: 10, hint: "sesi fokus" },
];

export function SettingsModal({
  isOpen, onClose, settings, onSave, ringtoneId, onRingtoneChange, ringtoneRepeat, onRingtoneRepeatChange,
}: SettingsModalProps) {
  const [draft, setDraft] = useState(settings);
  const [confirmClear, setConfirmClear] = useState(false);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSave(draft);
  };
  const clearData = () => {
    Object.keys(localStorage).filter(key => key.startsWith("pomodoro-")).forEach(key => localStorage.removeItem(key));
    window.location.reload();
  };

  return (
    <AppDialog open={isOpen} onClose={onClose} title="Pengaturan">
      <form onSubmit={submit} className="grid gap-6">
        <fieldset className="grid gap-3">
          <legend className="font-bold mb-3">Durasi timer</legend>
          {FIELDS.map(field => (
            <div key={field.key} className="flex items-center justify-between gap-3">
              <label htmlFor={field.key} className="text-sm font-medium">{field.label}</label>
              <div className="flex items-center gap-2 shrink-0">
                <input
                  id={field.key} type="number" min={1} max={field.max} required
                  className="field-input !w-20 text-center" value={draft[field.key]}
                  onChange={event => setDraft(previous => ({ ...previous, [field.key]: Math.max(1, Math.min(field.max, Number(event.target.value) || 1)) }))}
                />
                <span className="text-xs w-14">{field.hint}</span>
              </div>
            </div>
          ))}
        </fieldset>

        <fieldset className="border-t pt-5" style={{ borderColor: "var(--pomo-neutral-light)" }}>
          <legend className="font-bold">Bunyi selesai</legend>
          <div className="grid gap-2 mt-3">
            {RINGTONES.map(ringtone => (
              <div key={ringtone.id} className="flex items-center gap-2">
                <button type="button" className="choice-button flex-1 text-left" aria-pressed={ringtoneId === ringtone.id} onClick={() => onRingtoneChange(ringtone.id)}>{ringtone.name}</button>
                <button type="button" className="header-action !w-10 !h-10 !p-0" onClick={() => playRingRepeated(ringtone.id, ringtoneRepeat)} aria-label={`Dengarkan ${ringtone.name}`}><Play size={16} aria-hidden="true" /></button>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-4 gap-3">
            <label htmlFor="ringtone-repeat" className="text-sm font-medium">Jumlah pengulangan</label>
            <input id="ringtone-repeat" type="number" min={1} max={5} className="field-input !w-20 text-center" value={ringtoneRepeat} onChange={event => onRingtoneRepeatChange(Math.max(1, Math.min(5, Number(event.target.value) || 1)))} />
          </div>
        </fieldset>

        <div className="border-t pt-5" style={{ borderColor: "var(--pomo-neutral-light)" }}>
          <p className="font-bold mb-2">Data aplikasi</p>
          {confirmClear ? (
            <div className="grid gap-3 text-sm">
              <p>Tugas, progres, playlist, dan pengaturan lokal akan dihapus permanen.</p>
              <div className="flex gap-2">
                <button type="button" className="action-button" onClick={clearData}>Ya, hapus semua</button>
                <button type="button" className="action-button action-button-secondary" onClick={() => setConfirmClear(false)}>Batal</button>
              </div>
            </div>
          ) : <button type="button" className="underline underline-offset-4 text-sm" onClick={() => setConfirmClear(true)}>Hapus semua data</button>}
        </div>

        <div className="flex justify-end gap-2 border-t pt-5" style={{ borderColor: "var(--pomo-neutral-light)" }}>
          <button type="button" className="action-button action-button-secondary" onClick={onClose}>Batal</button>
          <button type="submit" className="action-button">Simpan</button>
        </div>
      </form>
    </AppDialog>
  );
}
