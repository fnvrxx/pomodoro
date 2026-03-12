import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Bell, Play, Minus, Plus, Palette, Database } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import type { TimerSettings } from '@/app/types';
import { RINGTONES, playRingRepeated } from '@/app/data/ringtones';

const THEMES = [
  { id: 'sage', name: 'Sage', preview: '#6B9B7A' },
  { id: 'pink', name: 'Pink', preview: '#D4849A' },
];

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: TimerSettings;
  onSave: (settings: TimerSettings) => void;
  ringtoneId: string;
  onRingtoneChange: (id: string) => void;
  ringtoneRepeat: number;
  onRingtoneRepeatChange: (n: number) => void;
  theme: string;
  onThemeChange: (id: string) => void;
}

export function SettingsModal({ isOpen, onClose, settings, onSave, ringtoneId, onRingtoneChange, ringtoneRepeat, onRingtoneRepeatChange, theme, onThemeChange }: SettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<TimerSettings>(settings);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLocalSettings(settings);
      setShowClearConfirm(false);
    }
  }, [isOpen, settings]);

  const handleSave = () => {
    onSave(localSettings);
  };

  const handleClose = () => {
    setLocalSettings(settings);
    onClose();
  };

  const updateSetting = <K extends keyof TimerSettings>(
    key: K,
    value: TimerSettings[K]
  ) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleClearData = () => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('pomodoro-'));
    keys.forEach(k => localStorage.removeItem(k));
    window.location.reload();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 modal-backdrop z-50"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4"
          >
            <div className="rounded-3xl p-6 w-full max-w-sm shadow-2xl pointer-events-auto max-h-[90vh] overflow-y-auto"
                 style={{ backgroundColor: "var(--pomo-card)" }}>
              {/* Header */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold tracking-widest"
                    style={{ color: "var(--pomo-text-muted)" }}>SETTING</h2>
                <div className="w-full h-px mt-3" style={{ backgroundColor: "var(--pomo-input)" }} />
              </div>

              {/* Timer Section */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5" style={{ color: "var(--pomo-neutral)" }} />
                  <span className="text-sm font-medium uppercase tracking-wider"
                        style={{ color: "var(--pomo-neutral)" }}>Timer</span>
                </div>

                <div className="mb-4">
                  <label className="block text-sm mb-3" style={{ color: "var(--pomo-text-secondary)" }}>Time (minutes)</label>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-xs mb-1 text-center"
                             style={{ color: "var(--pomo-text-muted)" }}>Pomodoro</label>
                      <Input
                        type="number"
                        min={1}
                        max={60}
                        value={localSettings.focusDuration}
                        onChange={(e) => updateSetting('focusDuration', Math.max(1, Math.min(60, parseInt(e.target.value) || 25)))}
                        className="border-none rounded-xl py-3 px-4 text-center font-medium"
                        style={{ backgroundColor: "var(--pomo-input)", color: "var(--pomo-text)" }}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs mb-1 text-center"
                             style={{ color: "var(--pomo-text-muted)" }}>Break</label>
                      <Input
                        type="number"
                        min={1}
                        max={30}
                        value={localSettings.breakDuration}
                        onChange={(e) => updateSetting('breakDuration', Math.max(1, Math.min(30, parseInt(e.target.value) || 5)))}
                        className="border-none rounded-xl py-3 px-4 text-center font-medium"
                        style={{ backgroundColor: "var(--pomo-input)", color: "var(--pomo-text)" }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between items-center">
                    <label className="text-sm" style={{ color: "var(--pomo-text-secondary)" }}>Long Break Interval</label>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      value={localSettings.longBreakInterval}
                      onChange={(e) => updateSetting('longBreakInterval', Math.max(1, Math.min(10, parseInt(e.target.value) || 4)))}
                      className="border-none rounded-xl py-2 px-3 text-center font-medium w-20"
                      style={{ backgroundColor: "var(--pomo-input)", color: "var(--pomo-text)" }}
                    />
                  </div>
                  <p className="text-xs mt-1" style={{ color: "var(--pomo-text-muted)" }}>
                    Take a long break after every {localSettings.longBreakInterval} focus sessions
                  </p>
                </div>

                <div>
                  <div className="flex justify-between items-center">
                    <label className="text-sm" style={{ color: "var(--pomo-text-secondary)" }}>Time Long Break (minutes)</label>
                    <Input
                      type="number"
                      min={1}
                      max={60}
                      value={localSettings.longBreakDuration}
                      onChange={(e) => updateSetting('longBreakDuration', Math.max(1, Math.min(60, parseInt(e.target.value) || 15)))}
                      className="border-none rounded-xl py-2 px-3 text-center font-medium w-20"
                      style={{ backgroundColor: "var(--pomo-input)", color: "var(--pomo-text)" }}
                    />
                  </div>
                </div>
              </div>

              <div className="w-full h-px mb-6" style={{ backgroundColor: "var(--pomo-input)" }} />

              {/* Ringtone Section */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Bell className="w-5 h-5" style={{ color: "var(--pomo-neutral)" }} />
                  <span className="text-sm font-medium uppercase tracking-wider"
                        style={{ color: "var(--pomo-neutral)" }}>Ringtone</span>
                </div>
                <div className="space-y-2">
                  {RINGTONES.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => onRingtoneChange(r.id)}
                      className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-colors duration-150 cursor-pointer"
                      style={{
                        backgroundColor: ringtoneId === r.id ? "var(--pomo-primary)" : "var(--pomo-input)",
                        color: ringtoneId === r.id ? "white" : "var(--pomo-text)",
                      }}
                    >
                      <span className="text-sm font-medium">{r.name}</span>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); playRingRepeated(r.id, ringtoneRepeat); }}
                        className="p-1.5 rounded-full transition-colors duration-150"
                        style={{
                          backgroundColor: ringtoneId === r.id ? "rgba(255,255,255,0.2)" : "var(--pomo-neutral-light)",
                          color: ringtoneId === r.id ? "white" : "var(--pomo-text-secondary)",
                        }}
                        aria-label={`Preview ${r.name}`}
                      >
                        <Play className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between px-1">
                  <div>
                    <span className="text-sm" style={{ color: "var(--pomo-text-secondary)" }}>Repeat</span>
                    <p className="text-xs mt-0.5" style={{ color: "var(--pomo-text-muted)" }}>
                      {ringtoneRepeat === 1 ? 'Play once' : `Play ${ringtoneRepeat}× in a row`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onRingtoneRepeatChange(Math.max(1, ringtoneRepeat - 1))}
                      disabled={ringtoneRepeat <= 1}
                      className="w-8 h-8 rounded-full disabled:opacity-40 flex items-center justify-center transition-colors duration-150"
                      style={{ backgroundColor: "var(--pomo-input)" }}
                    >
                      <Minus className="w-3 h-3" style={{ color: "var(--pomo-text)" }} />
                    </button>
                    <span className="w-6 text-center font-bold" style={{ color: "var(--pomo-text)" }}>{ringtoneRepeat}</span>
                    <button
                      type="button"
                      onClick={() => onRingtoneRepeatChange(Math.min(5, ringtoneRepeat + 1))}
                      disabled={ringtoneRepeat >= 5}
                      className="w-8 h-8 rounded-full disabled:opacity-40 flex items-center justify-center transition-colors duration-150"
                      style={{ backgroundColor: "var(--pomo-input)" }}
                    >
                      <Plus className="w-3 h-3" style={{ color: "var(--pomo-text)" }} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="w-full h-px mb-6" style={{ backgroundColor: "var(--pomo-input)" }} />

              {/* Theme Section */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Palette className="w-5 h-5" style={{ color: "var(--pomo-neutral)" }} />
                  <span className="text-sm font-medium uppercase tracking-wider"
                        style={{ color: "var(--pomo-neutral)" }}>Theme</span>
                </div>
                <div className="flex gap-3">
                  {THEMES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => onThemeChange(t.id)}
                      className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-150"
                      style={{
                        backgroundColor: theme === t.id ? "var(--pomo-primary)" : "var(--pomo-input)",
                        color: theme === t.id ? "white" : "var(--pomo-text)",
                        border: theme === t.id ? "2px solid var(--pomo-primary-dark)" : "2px solid transparent",
                      }}
                    >
                      <div
                        className="w-5 h-5 rounded-full flex-shrink-0 border-2 border-white/50"
                        style={{ backgroundColor: t.preview }}
                      />
                      <span className="text-sm font-medium">{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="w-full h-px mb-6" style={{ backgroundColor: "var(--pomo-input)" }} />

              {/* Data Section */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Database className="w-5 h-5" style={{ color: "var(--pomo-neutral)" }} />
                  <span className="text-sm font-medium uppercase tracking-wider"
                        style={{ color: "var(--pomo-neutral)" }}>Data</span>
                </div>
                {!showClearConfirm ? (
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(true)}
                    className="w-full py-2.5 px-4 rounded-xl text-sm font-medium text-red-500 transition-colors duration-150"
                    style={{ backgroundColor: "var(--pomo-input)" }}
                  >
                    Clear All Data
                  </button>
                ) : (
                  <div className="p-3 rounded-xl" style={{ backgroundColor: "var(--pomo-input)" }}>
                    <p className="text-xs mb-3" style={{ color: "var(--pomo-text-secondary)" }}>
                      Semua data (tasks, progress, settings) akan dihapus permanen. Lanjutkan?
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleClearData}
                        className="flex-1 py-2 rounded-lg bg-red-500 text-white text-xs font-medium transition-colors hover:bg-red-600"
                      >
                        Ya, Hapus Semua
                      </button>
                      <button
                        onClick={() => setShowClearConfirm(false)}
                        className="flex-1 py-2 rounded-lg text-xs font-medium transition-colors"
                        style={{ backgroundColor: "var(--pomo-card)", color: "var(--pomo-text-secondary)" }}
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="w-full h-px mb-6" style={{ backgroundColor: "var(--pomo-input)" }} />

              {/* Footer Buttons */}
              <div className="flex justify-end gap-3">
                <Button
                  variant="ghost"
                  onClick={handleClose}
                  className="px-6 py-2 rounded-xl font-medium"
                  style={{ color: "var(--pomo-neutral)" }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  className="px-8 py-2 rounded-xl text-white font-medium transition-all duration-200"
                  style={{ backgroundColor: "var(--pomo-neutral-dark)" }}
                >
                  OK
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
