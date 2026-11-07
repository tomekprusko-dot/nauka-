import { useState } from "react";
import Logo from "./Logo";
import { describeAuthError, supabase } from "../sync/supabase";

// Logowanie emailem i hasłem. Hasło (a nie link w mailu), bo na iPhonie
// link z maila otwiera Safari, a nie zainstalowaną appkę.
function LoginView({ onUseLocal }) {
  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setInfo("");
    try {
      if (mode === "signin") {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
        // Po udanym logowaniu App sam przełączy widok (onAuthStateChange).
      } else {
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + window.location.pathname },
        });
        if (authError) throw authError;
        if (!data.session) {
          setInfo("Konto założone. Kliknij link w mailu od Supabase, a potem wróć tutaj i zaloguj się.");
          setMode("signin");
        }
      }
    } catch (authError) {
      setError(describeAuthError(authError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login">
      <div className="login-brand">
        <Logo size={88} />
        <h1>Ławka 120</h1>
        <p className="muted">Twój plan wyciskania: od 105 do 120 kg.</p>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        <h2>{mode === "signin" ? "Zaloguj się" : "Załóż konto"}</h2>
        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <label htmlFor="login-password">Hasło</label>
        <input
          id="login-password"
          type="password"
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          minLength={6}
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        {error && <p className="form-error">{error}</p>}
        {info && <p className="callout success">{info}</p>}
        <button type="submit" className="primary wide" disabled={busy}>
          {busy ? "Chwila…" : mode === "signin" ? "Zaloguj się" : "Załóż konto"}
        </button>
        <button
          type="button"
          className="link-button center"
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setError("");
          }}
        >
          {mode === "signin" ? "Nie masz konta? Załóż je" : "Masz już konto? Zaloguj się"}
        </button>
      </form>

      <button type="button" className="link-button center" onClick={onUseLocal}>
        Używaj bez konta (dane tylko na tym telefonie)
      </button>
    </div>
  );
}

export default LoginView;
