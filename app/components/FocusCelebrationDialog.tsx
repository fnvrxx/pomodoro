import { useState } from "react";
import type { FocusCelebration } from "../lib/celebration";
import { messageForSession } from "../data/motivationalQuotes";
import { AppDialog } from "./AppDialog";
import { ConfettiBurst } from "./ConfettiBurst";
import { DinosaurMascot } from "./DinosaurMascot";

interface FocusCelebrationDialogProps {
  session: FocusCelebration;
  completedSessions: number;
  onClose: () => void;
}

export function FocusCelebrationDialog({ session, completedSessions, onClose }: FocusCelebrationDialogProps) {
  const [replays, setReplays] = useState(0);

  return (
    <>
      <AppDialog open onClose={onClose} title="Sesi fokus selesai!" className="celebration-dialog">
        <div className="celebration-content">
          <button
            type="button"
            className="celebration-mascot-button"
            aria-label="Rayakan lagi"
            onClick={() => setReplays(count => count + 1)}
          >
            <span className="celebration-mascot" aria-hidden="true">
              <DinosaurMascot cue={{ kind: "complete", sequence: replays }} />
            </span>
            <span className="celebration-replay-label">Rayakan lagi</span>
          </button>
          <p className="celebration-duration">{session.duration} menit fokus tercatat.</p>
          <p className="celebration-message">{messageForSession(completedSessions)}</p>
          <p className="celebration-hint" role="status">{replays > 0 ? "Yeay! Tetap semangat." : "Tetap semangat!"}</p>
          <button type="button" className="action-button celebration-rest-button" onClick={onClose}>Istirahat dulu</button>
        </div>
      </AppDialog>
      <ConfettiBurst key={`${session.sequence}-${replays}`} />
    </>
  );
}
