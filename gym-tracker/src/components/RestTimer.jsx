import { useEffect, useState } from "react";
import { beep } from "../utils/sound";

// Pasek na dole ekranu, który odlicza przerwę między seriami.
// Trzymamy godzinę końca (endsAt), a nie "ile zostało" - dzięki temu
// odliczanie jest dokładne nawet, gdy telefon na chwilę uśpi appkę.
function RestTimer({ timer, onAdd, onClose }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  // Ekran nie gaśnie w trakcie przerwy (jeśli telefon na to pozwala).
  useEffect(() => {
    let lock = null;
    navigator.wakeLock
      ?.request("screen")
      .then((sentinel) => {
        lock = sentinel;
      })
      .catch(() => {});
    return () => {
      lock?.release().catch(() => {});
    };
  }, []);

  const remaining = Math.max(0, Math.ceil((timer.endsAt - now) / 1000));
  const finished = remaining === 0;

  // Sygnał i wibracja (wibracja działa tylko na Androidzie), gdy przerwa się skończy.
  useEffect(() => {
    if (!finished) return;
    beep();
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
  }, [finished]);

  const minutes = Math.floor(remaining / 60);
  const seconds = String(remaining % 60).padStart(2, "0");
  const percent = Math.min(100, (remaining / timer.total) * 100);

  return (
    <div className={`rest-timer ${finished ? "finished" : ""}`} role="timer" aria-live="polite">
      <div className="rest-timer-bar" style={{ width: `${percent}%` }} />
      <div className="rest-timer-content">
        <div>
          <div className="rest-timer-time">{finished ? "Do roboty!" : `${minutes}:${seconds}`}</div>
          <div className="rest-timer-label">{timer.label}</div>
        </div>
        {!finished && (
          <button type="button" className="secondary" onClick={() => onAdd(30)}>
            +30 s
          </button>
        )}
        <button type="button" className="secondary" onClick={onClose}>
          {finished ? "OK" : "Pomiń"}
        </button>
      </div>
    </div>
  );
}

export default RestTimer;
