import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { TimerSettings } from '@/types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: TimerSettings;
  onSave: (settings: TimerSettings) => void;
}

export function SettingsModal({ isOpen, onClose, settings, onSave }: SettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<TimerSettings>(settings);

  // Reset local settings when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalSettings(settings);
    }
  }, [isOpen, settings]);

  const handleSave = () => {
    onSave(localSettings);
  };

  const handleClose = () => {
    setLocalSettings(settings); // Reset to original values
    onClose();
  };

  const updateSetting = <K extends keyof TimerSettings>(
    key: K,
    value: TimerSettings[K]
  ) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 modal-backdrop z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4"
          >
            <div className="bg-[#E8E4DC] rounded-3xl p-6 w-full max-w-sm shadow-2xl pointer-events-auto max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-[#8A8A8A] tracking-widest">SETTING</h2>
                <div className="w-full h-px bg-[#D4CFC6] mt-3" />
              </div>

              {/* Timer Section */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-[#6B7B6B]" />
                  <span className="text-sm font-medium text-[#6B7B6B] uppercase tracking-wider">Timer</span>
                </div>

                {/* Time Inputs */}
                <div className="mb-4">
                  <label className="block text-sm text-[#5A5A5A] mb-3">Time (minutes)</label>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-xs text-[#8A8A8A] mb-1 text-center">Pomodoro</label>
                      <Input
                        type="number"
                        min={1}
                        max={60}
                        value={localSettings.focusDuration}
                        onChange={(e) => updateSetting('focusDuration', Math.max(1, Math.min(60, parseInt(e.target.value) || 25)))}
                        className="bg-[#D4CFC6] border-none rounded-xl py-3 px-4 
                                 text-[#2D4A35] text-center font-medium
                                 focus:ring-2 focus:ring-[#6B9B7A]/50"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-[#8A8A8A] mb-1 text-center">Break</label>
                      <Input
                        type="number"
                        min={1}
                        max={30}
                        value={localSettings.breakDuration}
                        onChange={(e) => updateSetting('breakDuration', Math.max(1, Math.min(30, parseInt(e.target.value) || 5)))}
                        className="bg-[#D4CFC6] border-none rounded-xl py-3 px-4 
                                 text-[#2D4A35] text-center font-medium
                                 focus:ring-2 focus:ring-[#6B9B7A]/50"
                      />
                    </div>
                  </div>
                </div>

                {/* Long Break Interval */}
                <div className="mb-4">
                  <div className="flex justify-between items-center">
                    <label className="text-sm text-[#5A5A5A]">Long Break Interval</label>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      value={localSettings.longBreakInterval}
                      onChange={(e) => updateSetting('longBreakInterval', Math.max(1, Math.min(10, parseInt(e.target.value) || 4)))}
                      className="bg-[#D4CFC6] border-none rounded-xl py-2 px-3 
                               text-[#2D4A35] text-center font-medium w-20
                               focus:ring-2 focus:ring-[#6B9B7A]/50"
                    />
                  </div>
                  <p className="text-xs text-[#8A8A8A] mt-1">
                    Take a long break after every {localSettings.longBreakInterval} focus sessions
                  </p>
                </div>

                {/* Long Break Duration */}
                <div>
                  <div className="flex justify-between items-center">
                    <label className="text-sm text-[#5A5A5A]">Time Long Break (minutes)</label>
                    <Input
                      type="number"
                      min={1}
                      max={60}
                      value={localSettings.longBreakDuration}
                      onChange={(e) => updateSetting('longBreakDuration', Math.max(1, Math.min(60, parseInt(e.target.value) || 15)))}
                      className="bg-[#D4CFC6] border-none rounded-xl py-2 px-3 
                               text-[#2D4A35] text-center font-medium w-20
                               focus:ring-2 focus:ring-[#6B9B7A]/50"
                    />
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="w-full h-px bg-[#D4CFC6] mb-6" />

              {/* Footer Buttons */}
              <div className="flex justify-end gap-3">
                <Button
                  variant="ghost"
                  onClick={handleClose}
                  className="px-6 py-2 rounded-xl text-[#6B7B6B] hover:bg-[#D4CFC6] font-medium"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  className="px-8 py-2 rounded-xl bg-[#4A5A4A] hover:bg-[#3A4A3A] 
                           text-white font-medium transition-all duration-200"
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
