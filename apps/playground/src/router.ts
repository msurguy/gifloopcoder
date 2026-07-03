// Minimal hash router: #/ (editor), #/docs/<slug>, #/s/<payload>, #/example/<id>.
// Hash routing needs no server rewrites, which suits GitHub Pages.

import { useEffect, useState } from 'react';

export type Route =
  | { name: 'editor' }
  | { name: 'docs'; slug: string }
  | { name: 'share'; payload: string }
  | { name: 'example'; id: string };

export function parseHash(hash: string): Route {
  const path = hash.replace(/^#\/?/, '');
  if (path.startsWith('docs')) {
    const slug = path.split('/')[1] ?? 'intro';
    return { name: 'docs', slug };
  }
  if (path.startsWith('s/')) {
    return { name: 'share', payload: path.slice(2) };
  }
  if (path.startsWith('example/')) {
    return { name: 'example', id: path.slice('example/'.length) };
  }
  return { name: 'editor' };
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseHash(location.hash));
  useEffect(() => {
    const onHashChange = () => setRoute(parseHash(location.hash));
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);
  return route;
}

export function navigate(hash: string): void {
  location.hash = hash;
}
