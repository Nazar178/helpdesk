import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export function Home() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/account/me');
        if (!response.ok) {
          throw new Error('Błąd podczas pobierania danych użytkownika.');
        }

        const data = await response.json();
        setProfile(data);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Nieznany błąd');
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const isAdmin = profile?.roles?.includes('Admin');

  return (
    <div className="container">
      
      <div className="jumbotron mt-4 p-4 bg-light border rounded">
        <h1 className="display-5 mb-3">HelpDesk – panel główny</h1>
        <p className="lead">
          System zgłoszeń technicznych dla pracowników uczelni / firmy.
          Zgłaszaj problemy, śledź status i komunikuj się z administratorem IT.
        </p>

        {profile && (
          <p className="mb-1">
            <strong>Zalogowany użytkownik:</strong> {profile.userName}
          </p>
        )}

        <div className="mt-3 d-flex flex-wrap gap-2">
          <Link to="/tickets" className="btn btn-primary">
            Zgłoś nowy problem
          </Link>

          <Link to="/tickets" className="btn btn-outline-primary">
            Przejdź do listy zgłoszeń
          </Link>

          {isAdmin && (
            <>
              <Link to="/admin" className="btn btn-warning">
                Panel admina
              </Link>
              <Link to="/reports" className="btn btn-outline-secondary">
                Raporty
              </Link>
            </>
          )}

          <button
            type="button"
            className="btn btn-link"
            onClick={() => setShowHowItWorks(prev => !prev)}
          >
            {showHowItWorks ? 'Ukryj: Jak działa system?' : 'Pokaż: Jak działa system?'}
          </button>
        </div>
      </div>

      
      {showHowItWorks && (
        <div className="card mb-4">
          <div className="card-header">
            Jak działa system HelpDesk?
          </div>
          <div className="card-body">
            <ol>
              <li>
                <strong>Zgłaszasz problem</strong> – w zakładce <em>„Zgłoszenia”</em>
                wypełniasz krótki formularz (tytuł, opis, kategoria, priorytet).
              </li>
              <li>
                <strong>Administrator przyjmuje zgłoszenie</strong> – przypisuje je do siebie
                i zmienia status na <em>„W realizacji”</em>, dodając komentarze techniczne.
              </li>
              <li>
                <strong>Otrzymujesz informację zwrotną</strong> – w tabeli zgłoszeń widzisz
                status oraz komentarz administratora, aż do statusu <em>„Rozwiązane”</em>.
              </li>
            </ol>
          </div>
        </div>
      )}

      {loading && <p>Ładowanie danych...</p>}
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      
      {profile && (
        <>
          <h3 className="mt-4 mb-3">Twoje statystyki zgłoszeń</h3>
          <div className="row mb-4">
            <div className="col-md-3 mb-3">
              <div className="card text-center border-primary h-100">
                <div className="card-body">
                  <h5 className="card-title">Wszystkie zgłoszenia</h5>
                  <p className="display-6">
                    {profile.createdTicketsCount}
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-3 mb-3">
              <div className="card text-center border-warning h-100">
                <div className="card-body">
                  <h5 className="card-title">Otwarte</h5>
                  <p className="display-6">
                    {profile.openTicketsCount}
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-3 mb-3">
              <div className="card text-center border-success h-100">
                <div className="card-body">
                  <h5 className="card-title">Rozwiązane</h5>
                  <p className="display-6">
                    {profile.resolvedTicketsCount}
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-3 mb-3">
              <div className="card text-center border-info h-100">
                <div className="card-body">
                  <h5 className="card-title">Przypisane do Ciebie</h5>
                  <p className="display-6">
                    {profile.assignedTicketsCount}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      
      <h3 className="mt-4 mb-3">Co możesz zrobić w systemie?</h3>
      <div className="row">
        <div className="col-md-4 mb-3">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Zgłaszanie problemów</h5>
              <p className="card-text">
                Jedno miejsce do zgłaszania problemów związanych ze sprzętem,
                siecią, oprogramowaniem czy innymi kwestiami technicznymi.
              </p>
              <Link to="/tickets" className="btn btn-outline-primary btn-sm">
                Przejdź do zgłoszeń
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Śledzenie statusu</h5>
              <p className="card-text">
                Każde zgłoszenie ma status oraz historię zmian – zawsze wiesz,
                na jakim etapie jest Twoja sprawa.
              </p>
              <Link to="/tickets" className="btn btn-outline-secondary btn-sm">
                Zobacz swoje zgłoszenia
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Raportowanie (dla admina)</h5>
              <p className="card-text">
                Administratorzy mają dostęp do panelu zarządzania zgłoszeniami
                oraz raportów obciążenia i skuteczności zespołu.
              </p>
              {isAdmin ? (
                <Link to="/reports" className="btn btn-outline-dark btn-sm">
                  Otwórz raporty
                </Link>
              ) : (
                <span className="text-muted">Dostępne tylko dla administratorów</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
