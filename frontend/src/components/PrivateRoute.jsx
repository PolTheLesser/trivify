import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * PrivateRoute-Komponente
 *
 * Diese Komponente schützt bestimmte Routen vor dem Zugriff nicht authentifizierter Nutzer.
 * Wenn kein angemeldeter Nutzer vorhanden ist, wird automatisch zur Login-Seite weitergeleitet.
 * Nach erfolgreichem Login kann der Nutzer zur ursprünglich angeforderten Route zurückkehren.
 *
 * Funktionalitäten:
 * - Zugriffsschutz basierend auf Authentifizierungsstatus
 * - Redirect zur Login-Seite bei fehlender Anmeldung
 * - Speicherung der ursprünglichen Ziel-URL im Navigationszustand (state.from) für Weiterleitung nach Login
 */
const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute; 