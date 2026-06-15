import React from 'react';

export function LoadingState({ label = 'Loading' }) {
  return <div className="state-box">{label}...</div>;
}

export function ErrorState({ message }) {
  return <div className="state-box error">{message}</div>;
}

export function EmptyState({ message }) {
  return <div className="state-box">{message}</div>;
}
