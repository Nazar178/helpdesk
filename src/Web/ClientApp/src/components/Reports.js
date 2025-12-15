import React, { useEffect, useState } from 'react';

export function Reports() {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function loadSummary() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/reports/tickets-summary');
      if (!response.ok) {
        throw new Error('Błąd podczas pobierania raportu.');
      }

      const data = await response.json();
      setSummary(data);
    } catch (err) {
      setError(err.message || 'Nieznany błąd');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSummary();
  }, []);

 

  const totalAll = summary.reduce((sum, r) => sum + r.totalTickets, 0);
  const totalNew = summary.reduce((sum, r) => sum + r.newTickets, 0);
  const totalInProgress = summary.reduce((sum, r) => sum + r.inProgressTickets, 0);
  const totalResolved = summary.reduce((sum, r) => sum + r.resolvedTickets, 0);
  const totalRejected = summary.reduce((sum, r) => sum + r.rejectedTickets, 0);

  function percent(part, whole) {
    if (!whole || whole === 0) return 0;
    return Math.round((part * 100) / whole);
  }

  return (
    <div>
      <h1>Raport zgłoszeń technicznych</h1>

      {loading && <p>Ładowanie danych raportu...</p>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && summary.length === 0 && !error && (
        <p>Brak danych do raportu.</p>
      )}

      {summary.length > 0 && (
        <>
         
          <h3>Podsumowanie według kategorii</h3>
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Kategoria</th>
                <th>Wszystkie</th>
                <th>Nowe</th>
                <th>W realizacji</th>
                <th>Rozwiązane</th>
                <th>Odrzucone</th>
              </tr>
            </thead>
            <tbody>
              {summary.map(row => (
                <tr key={row.categoryId}>
                  <td>{row.categoryName}</td>
                  <td>{row.totalTickets}</td>
                  <td>{row.newTickets}</td>
                  <td>{row.inProgressTickets}</td>
                  <td>{row.resolvedTickets}</td>
                  <td>{row.rejectedTickets}</td>
                </tr>
              ))}
            </tbody>
          </table>

         
          <h3>Wykres: liczba zgłoszeń wg kategorii</h3>
          <div className="mb-4">
            {summary.map(row => {
              const pct = percent(row.totalTickets, totalAll);
              return (
                <div key={row.categoryId} className="mb-3">
                  <div>
                    <strong>
                      {row.categoryName} ({row.totalTickets} zgłoszeń)
                    </strong>
                  </div>
                  <div className="progress" style={{ height: '22px', marginTop: '4px' }}>
                    <div
                      className="progress-bar"
                      role="progressbar"
                      style={{ width: `${pct}%` }}
                      aria-valuenow={pct}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    >
                      {pct}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

         
          <h3>Podsumowanie statusów (łącznie dla wszystkich kategorii)</h3>
          <ul>
            <li>Wszystkie zgłoszenia: <strong>{totalAll}</strong></li>
            <li>Nowe: <strong>{totalNew}</strong> ({percent(totalNew, totalAll)}%)</li>
            <li>W realizacji: <strong>{totalInProgress}</strong> ({percent(totalInProgress, totalAll)}%)</li>
            <li>Rozwiązane: <strong>{totalResolved}</strong> ({percent(totalResolved, totalAll)}%)</li>
            <li>Odrzucone: <strong>{totalRejected}</strong> ({percent(totalRejected, totalAll)}%)</li>
          </ul>
        </>
      )}
    </div>
  );
}
