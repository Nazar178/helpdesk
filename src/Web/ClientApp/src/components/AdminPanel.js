import React, { useEffect, useState } from 'react';

export function AdminPanel() {
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [acceptingId, setAcceptingId] = useState(null);

 
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('createdAt'); // createdAt | priority | status
  const [sortDir, setSortDir] = useState('DESC'); // ASC | DESC

  
  const [successMessage, setSuccessMessage] = useState(null);

  async function loadTickets() {
    try {
      setError(null);
      const response = await fetch('/api/admin/tickets');
      if (!response.ok) {
        throw new Error('Błąd podczas pobierania zgłoszeń administratora');
      }
      const data = await response.json();
      setTickets(data);
    } catch (err) {
      setError(err.message || 'Nieznany błąd');
      setSuccessMessage(null);
    }
  }

  useEffect(() => {
    loadTickets();
  }, []);

  function handleFieldChange(id, field, value) {
    setTickets(prev =>
      prev.map(t =>
        t.id === id ? { ...t, [field]: value } : t
      )
    );
  }

 
  async function handleAccept(id) {
    try {
      setAcceptingId(id);
      setError(null);
      setSuccessMessage(null);

      const response = await fetch(`/api/admin/tickets/${id}/accept`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Błąd podczas przyjmowania zgłoszenia.');
      }

      await loadTickets();
      setSuccessMessage('Przyjęto zgłoszenie.');
    } catch (err) {
      setError(err.message || 'Błąd podczas przyjmowania zgłoszenia.');
      setSuccessMessage(null);
    } finally {
      setAcceptingId(null);
    }
  }

  async function handleSave(id) {
    const ticket = tickets.find(t => t.id === id);
    if (!ticket) return;

    try {
      setSavingId(id);
      setError(null);
      setSuccessMessage(null);

      const response = await fetch(`/api/admin/tickets/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: ticket.status,
          adminComment: ticket.adminComment ?? ''
        })
      });

      if (!response.ok) {
        throw new Error('Błąd podczas zapisywania zmian.');
      }

      await loadTickets();
      setSuccessMessage('Zapisano zmianę!');
    } catch (err) {
      setError(err.message || 'Błąd podczas zapisywania zmian.');
      setSuccessMessage(null);
    } finally {
      setSavingId(null);
    }
  }

  
  async function handleDelete(id) {
    if (!window.confirm('Na pewno usunąć zgłoszenie?')) return;

    try {
      setDeletingId(id);
      setError(null);
      setSuccessMessage(null);

      const response = await fetch(`/api/admin/tickets/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Błąd podczas usuwania zgłoszenia.');
      }

      setTickets(prev => prev.filter(t => t.id !== id));
      setSuccessMessage('Usunięto zgłoszenie.');
    } catch (err) {
      setError(err.message || 'Błąd podczas usuwania zgłoszenia.');
      setSuccessMessage(null);
    } finally {
      setDeletingId(null);
    }
  }

  function formatPriority(p) {
    if (p === 1 || p === '1') return 'Niski';
    if (p === 3 || p === '3') return 'Wysoki';
    return 'Normalny';
  }

 
  function applyFilterAndSort(list) {
    let result = [...list];

    
    if (statusFilter !== 'ALL') {
      result = result.filter(t => t.status === statusFilter);
    }

    
    if (priorityFilter !== 'ALL') {
      result = result.filter(t => String(t.priority) === priorityFilter);
    }

    result.sort((a, b) => {
      let cmp = 0;

      if (sortBy === 'createdAt') {
        cmp = new Date(a.createdAt) - new Date(b.createdAt);
      } else if (sortBy === 'priority') {
        cmp = a.priority - b.priority;
      } else if (sortBy === 'status') {
        
        cmp = a.status.localeCompare(b.status);
      }

      return sortDir === 'ASC' ? cmp : -cmp;
    });

    return result;
  }

  const visibleTickets = applyFilterAndSort(tickets);

  return (
    <div>
      <h1>Panel administratora – zgłoszenia techniczne</h1>

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

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

    
      <div className="mb-3 d-flex flex-wrap gap-3">
        <div className="me-3">
          <label className="form-label me-2">Status:</label>
          <select
            className="form-select d-inline-block w-auto"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="ALL">Wszystkie</option>
            <option value="Nowe">Nowe</option>
            <option value="W realizacji">W realizacji</option>
            <option value="Rozwiązane">Rozwiązane</option>
            <option value="Odrzucone">Odrzucone</option>
          </select>
        </div>

        <div className="me-3">
          <label className="form-label me-2">Priorytet:</label>
          <select
            className="form-select d-inline-block w-auto"
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
          >
            <option value="ALL">Wszystkie</option>
            <option value="1">Niski</option>
            <option value="2">Normalny</option>
            <option value="3">Wysoki</option>
          </select>
        </div>

        <div className="me-3">
          <label className="form-label me-2">Sortuj wg:</label>
          <select
            className="form-select d-inline-block w-auto"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          >
            <option value="createdAt">Data utworzenia</option>
            <option value="priority">Priorytet</option>
            <option value="status">Status</option>
          </select>
        </div>

        <div className="me-3">
          <label className="form-label me-2">Kierunek:</label>
          <select
            className="form-select d-inline-block w-auto"
            value={sortDir}
            onChange={e => setSortDir(e.target.value)}
          >
            <option value="DESC">Malejąco</option>
            <option value="ASC">Rosnąco</option>
          </select>
        </div>
      </div>

      <table className="table table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tytuł</th>
            <th>Kategoria</th>
            <th>Priorytet</th>
            <th>Status</th>
            <th>Komentarz administratora</th>
            <th>Utworzył</th>
            <th>Przyjął</th>
            <th>Data utworzenia</th>
            <th>Akcje</th>
          </tr>
        </thead>
        <tbody>
          {visibleTickets.map(t => (
            <tr key={t.id}>
              <td>{t.id}</td>
              <td>{t.title}</td>
              <td>{t.categoryName}</td>
              <td>{formatPriority(t.priority)}</td>
              <td>
                <select
                  className="form-control"
                  value={t.status}
                  onChange={e => handleFieldChange(t.id, 'status', e.target.value)}
                  disabled={!t.isAccepted}
                >
                  <option value="Nowe">Nowe</option>
                  <option value="W realizacji">W realizacji</option>
                  <option value="Rozwiązane">Rozwiązane</option>
                  <option value="Odrzucone">Odrzucone</option>
                </select>
              </td>
              <td>
                <textarea
                  className="form-control"
                  value={t.adminComment || ''}
                  onChange={e => handleFieldChange(t.id, 'adminComment', e.target.value)}
                  rows="2"
                  disabled={!t.isAccepted}
                />
              </td>
              <td>{t.createdBy}</td>
              <td>{t.assignedToUserId || <span className="text-muted">–</span>}</td>
              <td>{new Date(t.createdAt).toLocaleString()}</td>
              <td>
                {!t.isAccepted && (
                  <button
                    className="btn btn-secondary btn-sm me-2"
                    onClick={() => handleAccept(t.id)}
                    disabled={acceptingId === t.id}
                  >
                    Przyjmij
                  </button>
                )}
                <button
                  className="btn btn-primary btn-sm me-2"
                  onClick={() => handleSave(t.id)}
                  disabled={savingId === t.id || !t.isAccepted}
                >
                  Zapisz
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(t.id)}
                  disabled={deletingId === t.id}
                >
                  Usuń
                </button>
              </td>
            </tr>
          ))}

          {visibleTickets.length === 0 && (
            <tr>
              <td colSpan="10">Brak zgłoszeń.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
