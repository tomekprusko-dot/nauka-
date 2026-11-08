import { useState } from "react";

const DISMISS_KEY = "gym-tracker-install-hint-dismissed";

function isStandalone() {
  return window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function isIos() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function wasDismissed() {
  try {
    return localStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

// Na iPhonie Safari nie pokazuje przycisku "Zainstaluj" - trzeba to zrobić
// ręcznie, więc podpowiadamy jak. W zainstalowanej appce pasek znika.
function InstallHint() {
  const [hidden, setHidden] = useState(() => isStandalone() || wasDismissed());
  if (hidden) return null;

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // nic
    }
    setHidden(true);
  }

  return (
    <div className="install-hint" role="note">
      <p>
        {isIos() ? (
          <>
            Zainstaluj appkę: stuknij <strong>Udostępnij</strong> (kwadrat ze strzałką), potem{" "}
            <strong>Do ekranu początkowego</strong>.
          </>
        ) : (
          <>
            Zainstaluj appkę: w menu przeglądarki wybierz <strong>Zainstaluj aplikację</strong> lub{" "}
            <strong>Dodaj do ekranu głównego</strong>.
          </>
        )}
      </p>
      <button type="button" className="link-button" onClick={dismiss}>
        Zamknij
      </button>
    </div>
  );
}

export default InstallHint;
