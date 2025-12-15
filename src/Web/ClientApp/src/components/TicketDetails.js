import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

export function TicketDetails() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function formatPriority(p) {
    if (p === 1 || p === '1') return 'Niski';
    if (p === 3 || p === '3') return 'Wysoki';
    return 'Normalny';
  }

  useEffect(() => {
    async function loadDetails() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/tickets/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Zgłoszenie nie zostało znalezione.');
          }
          throw new Error('Błąd podczas pobierania szczegółów zgłoszenia.');
        }

        const data = await response.json();
        setTicket(data);
      } catch (err) {
        setError(err.message || 'Nieznany błąd');
      } finally {
        setLoading(false);
      }
    }

    loadDetails();
  }, [id]);

  if (loading) return <p>Ładowanie...</p>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!ticket) return <p>Brak danych.</p>;

  return (
    <div>
      <h1>Szczegóły zgłoszenia #{ticket.id}</h1>

      <p>
        <Link to="/tickets">&laquo; Wróć do listy zgłoszeń</Link>
      </p>

      <dl className="row">
        <dt className="col-sm-3">Tytuł</dt>
        <dd className="col-sm-9">{ticket.title}</dd>

        <dt className="col-sm-3">Opis</dt>
        <dd className="col-sm-9">{ticket.description}</dd>

        <dt className="col-sm-3">Kategoria</dt>
        <dd className="col-sm-9">{ticket.categoryName || '-'}</dd>

        <dt className="col-sm-3">Priorytet</dt>
        <dd className="col-sm-9">{formatPriority(ticket.priority)}</dd>

        <dt className="col-sm-3">Status</dt>
        <dd className="col-sm-9">{ticket.status}</dd>

        <dt className="col-sm-3">Utworzył</dt>
        <dd className="col-sm-9">{ticket.createdBy}</dd>

        <dt className="col-sm-3">Data utworzenia</dt>
        <dd className="col-sm-9">
          {new Date(ticket.createdAt).toLocaleString()}
        </dd>

        <dt className="col-sm-3">Komentarz administratora</dt>
        <dd className="col-sm-9">
          {ticket.adminComment
            ? ticket.adminComment
            : <span className="text-muted">Brak komentarza</span>}
        </dd>
      </dl>

      <h3>Historia zmian statusu</h3>

      {(!ticket.history || ticket.history.length === 0) && (
        <p className="text-muted">Brak historii zmian statusu.</p>
      )}

      {ticket.history && ticket.history.length > 0 && (
        <table className="table table-sm table-striped">
          <thead>
            <tr>
              <th>Poprzedni status</th>
              <th>Nowy status</th>
              <th>Zmieniono przez</th>
              <th>Data zmiany</th>
              <th>Komentarz</th>
            </tr>
          </thead>
          <tbody>
            {ticket.history.map((h, index) => (
              <tr key={index}>
                <td>{h.oldStatus || '-'}</td>
                <td>{h.newStatus}</td>
                <td>{h.changedBy}</td>
                <td>{new Date(h.changedAt).toLocaleString()}</td>
                <td>{h.comment || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
