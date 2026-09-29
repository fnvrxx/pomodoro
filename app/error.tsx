"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="app-shell">
      <div className="surface p-6 w-full max-w-md">
        <h1 className="section-heading">Halaman gagal dimuat</h1>
        <p className="my-4">Coba muat ulang. Tugas dan progres yang tersimpan di browser tetap tersedia.</p>
        <button type="button" className="action-button" onClick={reset}>Coba lagi</button>
      </div>
    </main>
  );
}
