'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { getFirebaseAuth, getFirebaseDb, isFirebaseConfigured } from '@/lib/firebase';

export function AdminDashboard() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<{ email: string | null } | null>(null);
  const [status, setStatus] = useState('');
  const [jsonDraft, setJsonDraft] = useState('{\n  "note": "Edit players.json in repo or connect Firebase"\n}');

  const firebaseReady = isFirebaseConfigured();

  const login = async () => {
    const auth = getFirebaseAuth();
    if (!auth) {
      setStatus('Add Firebase env vars in .env.local (see .env.example)');
      return;
    }
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      setUser({ email: cred.user.email });
      setStatus('Signed in');
    } catch {
      setStatus('Login failed — check credentials');
    }
  };

  const logout = async () => {
    const auth = getFirebaseAuth();
    if (auth) await signOut(auth);
    setUser(null);
  };

  const saveDraft = async () => {
    const db = getFirebaseDb();
    if (!db || !user) {
      setStatus('Firebase not configured or not signed in');
      return;
    }
    try {
      JSON.parse(jsonDraft);
      await setDoc(doc(db, 'cms', 'draft'), { content: jsonDraft, updatedAt: new Date().toISOString() });
      setStatus('Saved draft to Firestore cms/draft');
    } catch {
      setStatus('Invalid JSON');
    }
  };

  return (
    <div className="space-y-8">
      {!firebaseReady && (
        <div className="rounded-lg border border-ball/30 bg-ball/5 p-4 text-sm">
          <strong>Firebase not configured.</strong> Copy <code>.env.example</code> to <code>.env.local</code> and add your project keys.
          Until then, edit JSON files in the repo (<code>players.json</code>, <code>stories.json</code>, etc.) and push — GitHub Actions syncs CricHeroes stats weekly.
        </div>
      )}

      <section className="rounded-lg border border-line bg-paper p-6">
        <h2 className="text-xl font-semibold">Admin login</h2>
        {!user ? (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="rounded border border-line px-3 py-2" />
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" className="rounded border border-line px-3 py-2" />
            <button type="button" className="btn btn-primary" onClick={login}>Sign in</button>
          </div>
        ) : (
          <div className="mt-4 flex items-center gap-4">
            <span>Signed in as {user.email}</span>
            <button type="button" className="btn btn-ghost" onClick={logout}>Sign out</button>
          </div>
        )}
      </section>

      <section className="rounded-lg border border-line bg-paper p-6">
        <h2 className="text-xl font-semibold">CMS capabilities</h2>
        <ul className="mt-3 list-inside list-disc text-sm text-ink-soft">
          <li>Add / update players → <code>players.json</code> or Firestore</li>
          <li>Create matches &amp; stories → <code>stories.json</code></li>
          <li>Gallery → <code>gallery.json</code></li>
          <li>Sponsors → <code>sponsors.json</code></li>
          <li>Homepage slider → <code>home.json</code></li>
          <li>Weekly CricHeroes sync → GitHub Action <code>sync-stats.yml</code></li>
        </ul>
      </section>

      <section className="rounded-lg border border-line bg-paper p-6">
        <h2 className="text-xl font-semibold">Firestore draft editor</h2>
        <textarea
          value={jsonDraft}
          onChange={(e) => setJsonDraft(e.target.value)}
          rows={10}
          className="mt-3 w-full rounded border border-line bg-cream p-3 font-mono text-sm"
        />
        <button type="button" className="btn btn-primary mt-3" onClick={saveDraft} disabled={!user}>
          Save to Firestore
        </button>
      </section>

      {status && <p className="text-sm text-willow">{status}</p>}
    </div>
  );
}
