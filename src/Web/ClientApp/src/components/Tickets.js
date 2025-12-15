import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [categories, setCategories] = useState([]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState(2);
  const [categoryId, setCategoryId] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  
  const [successMessage, setSuccessMessage] = useState(null);

  async function loadTickets() {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/tickets');
      if (!response.ok) {
        throw new Error('Błąd podczas pobierania zgłoszeń');
      }
      const data = await response.json();
      setTickets(data);
    } catch (err) {
      setError(err.message || 'Nieznany błąd');
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories() {
    try {
      const response = await fetch('/api/tickets/categories');
      if (!response.ok) {
        throw new Error('Błąd podczas pobierania kategorii');
      }
      const data = await response.json();
      setCategories(data);
      if (data.length > 0 && !categoryId) {
        setCategoryId(String(data[0].id));
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function loadUser() {
    try {
      const response = await fetch('/api/account/me');
      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(data.isAuthenticated);
      }
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadTickets();
    loadCategories();
    loadUser();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          description,
          priority: Number(priority),
          categoryId: Number(categoryId)
        })
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error('Aby zgłosić problem, musisz być zalogowany.');
      }

      if (!response.ok) {
        throw new Error('Błąd podczas tworzenia zgłoszenia');
      }

      setTitle('');
      setDescription('');
      setPriority(2);

      await loadTickets();
      setSuccessMessage('Zgłoszenie zostało zapisane!');
    } catch (err) {
      setError(err.message || 'Nieznany błąd');
      setSuccessMessage(null);
    }
  }

  function formatPriority(p) {
    if (p === 1 || p === '1') return 'Niski';
    if (p === 3 || p === '3') return 'Wysoki';
    return 'Normalny';
  }

  return (
    <div>
      <h1>System zgłoszeń technicznych</h1>

      {!isAuthenticated && (
        <div className="alert alert-info">
          Aby zgłosić problem, zaloguj się w zakładce <strong>Account</strong>.
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {successMessage}
          <button
            type="button"
            className="btn-close"
            onClick={() => setSuccessMessage(null)}
          ></button>
        </div>
      )}

      <h3>Nowe zgłoszenie</h3>
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="form-group">
          <label>Tytuł</label>
          <input
            className="form-control"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            disabled={!isAuthenticated}
          />
        </div>

        <div className="form-group">
          <label>Opis problemu</label>
          <textarea
            className="form-control"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows="3"
            required
            disabled={!isAuthenticated}
          />
        </div>

        <div className="form-group">
          <label>Priorytet</label>
          <select
            className="form-control"
            value={priority}
            onChange={e => setPriority(e.target.value)}
            disabled={!isAuthenticated}
          >
            <option value={1}>Niski</option>
            <option value={2}>Normalny</option>
            <option value={3}>Wysoki</option>
          </select>
        </div>

        <div className="form-group">
          <label>Kategoria</label>
          <select
            className="form-control"
            value={categoryId}
            onChange={e => setCategoryId(e.target.value)}
            disabled={!isAuthenticated}
          >
            {categories.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <small className="form-text text-muted">
            Kategorie pochodzą z tabeli TicketCategories (Sprzęt, Sieć, Oprogramowanie, Inne).
          </small>
        </div>

        <button
          type="submit"
          className="btn btn-primary mt-2"
          disabled={!isAuthenticated}
        >
          Zgłoś problem
        </button>
      </form>

      <h3>Lista zgłoszeń</h3>

      {loading && <p>Ładowanie...</p>}
      {error && <div className="alert alert-danger">{error}</div>}
      {!loading && tickets.length === 0 && <p>Brak zgłoszeń.</p>}

      {tickets.length > 0 && (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tytuł</th>
              <th>Kategoria</th>
              <th>Priorytet</th>
              <th>Status</th>
              <th>Data utworzenia</th>
              <th>Komentarz administratora</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map(t => (
              <tr key={t.id}>
                <td>{t.id}</td>
                <td>
                  <Link to={`/tickets/${t.id}`}>
                    {t.title}
                  </Link>
                </td>
                <td>{t.categoryName || '-'}</td>
                <td>{formatPriority(t.priority)}</td>
                <td>{t.status}</td>
                <td>{new Date(t.createdAt).toLocaleString()}</td>
                <td>
                  {t.adminComment
                    ? t.adminComment
                    : <span className="text-muted">Brak komentarza</span>}
                </td>
              </tr>
            ))}

          </tbody>
        </table>
      )}
    </div>
  );
}
