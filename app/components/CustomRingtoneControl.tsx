import type { ChangeEvent } from "react";
import type { CustomRingtoneControls } from "../hooks/useCustomRingtone";
import { DEFAULT_RINGTONE_ID, playRingRepeated, stopAllRingtones } from "../data/ringtones";
import { CUSTOM_RINGTONE_ID } from "../services/customRingtone";

interface CustomRingtoneControlProps {
  custom: CustomRingtoneControls;
  selectedId: string;
  repeat: number;
  onSelect: (id: string) => void;
}

export function CustomRingtoneControl({ custom, selectedId, repeat, onSelect }: CustomRingtoneControlProps) {
  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    stopAllRingtones();
    if (await custom.upload(file)) onSelect(CUSTOM_RINGTONE_ID);
  };
  const remove = async () => {
    stopAllRingtones();
    if (await custom.remove() && selectedId === CUSTOM_RINGTONE_ID) onSelect(DEFAULT_RINGTONE_ID);
  };

  return (
    <div className="custom-ringtone mt-4">
      <label htmlFor="custom-ringtone-file" className="field-label">Audio sendiri</label>
      <p id="custom-ringtone-help" className="text-sm text-[var(--pomo-text-secondary)] mb-3">MP3, WAV, atau OGG. Maks. 5 MB. Tersimpan di browser ini.</p>
      <input id="custom-ringtone-file" type="file" accept="audio/*,.mp3,.wav,.ogg,.m4a" disabled={custom.busy}
        aria-describedby="custom-ringtone-help" className="audio-file-input" onChange={upload} />
      {custom.audio && (
        <div className="grid gap-2 mt-3">
          <button type="button" className="choice-button text-left break-words" disabled={custom.busy}
            aria-pressed={selectedId === CUSTOM_RINGTONE_ID} onClick={() => onSelect(CUSTOM_RINGTONE_ID)}>
            {custom.audio.name}
          </button>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="choice-button" disabled={custom.busy}
              onClick={() => playRingRepeated(CUSTOM_RINGTONE_ID, repeat, custom.audio?.buffer)}>Dengarkan audio</button>
            <button type="button" className="choice-button" onClick={stopAllRingtones}>Hentikan</button>
            <button type="button" className="choice-button" disabled={custom.busy} onClick={remove}>Hapus audio</button>
          </div>
        </div>
      )}
      {custom.busy && <p className="text-sm mt-2" role="status">Memuat audio…</p>}
      {custom.error && <p className="text-sm mt-2" role="alert">{custom.error}</p>}
    </div>
  );
}
