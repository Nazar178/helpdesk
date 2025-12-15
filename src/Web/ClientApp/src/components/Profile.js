import React, { useEffect, useState } from 'react';

export function Profile() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadProfile() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/account/me');
      if (!response.ok) {
        throw new Error('Błąd podczas pobierania profilu użytkownika.');
      }

      const json = await response.json();
      setData(json);
    } catch (err) {
      setError(err.message || 'Nieznany błąd');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  if (loading) {
    return <p>Ładowanie profilu...</p>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (!data || !data.isAuthenticated) {
    return (
      <div>
        <h1>Profil użytkownika</h1>
        <div className="alert alert-info">
          Aby zobaczyć swój profil, zaloguj się w zakładce <strong>Account</strong>.
        </div>
      </div>
    );
  }

  const roles = data.roles && data.roles.length > 0 ? data.roles.join(', ') : 'brak';

  return (
    <div>
      <h1>Profil użytkownika</h1>

      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Dane konta</h5>
          <p className="card-text">
            <strong>Login:</strong> {data.userName || '-'}
          </p>
          <p className="card-text">
            <strong>Email:</strong> {data.email || '-'}
          </p>
          <p className="card-text">
            <strong>Role:</strong> {roles}
          </p>
        </div>
      </div>

      <div className="row">
        <div className="col-md-3 mb-3">
          <div className="card text-bg-light">
            <div className="card-body">
              <h6 className="card-title">Zgłoszenia utworzone</h6>
              <p className="display-6">
                {data.createdTicketsCount}
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card text-bg-light">
            <div className="card-body">
              <h6 className="card-title">Zgłoszenia otwarte</h6>
              <p className="display-6">
                {data.openTicketsCount}
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card text-bg-light">
            <div className="card-body">
              <h6 className="card-title">Zgłoszenia rozwiązane</h6>
              <p className="display-6">
                {data.resolvedTicketsCount}
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card text-bg-light">
            <div className="card-body">
              <h6 className="card-title">Zgłoszenia przyjęte jako admin</h6>
              <p className="display-6">
                {data.assignedTicketsCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      <p className="text-muted mt-3">
        Dane pochodzą z tabeli <code>Tickets</code> oraz ról użytkownika w ASP.NET Identity.
      </p>
    </div>
  );
}
