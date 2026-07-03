import intro from './intro.md?raw';
import objects from './objects.md?raw';
import styles from './styles.md?raw';
import properties from './properties.md?raw';
import tips from './tips.md?raw';
import exporting from './export.md?raw';

export interface DocPage {
  slug: string;
  title: string;
  content: string;
}

export const DOC_PAGES: DocPage[] = [
  { slug: 'intro', title: 'Introduction', content: intro },
  { slug: 'objects', title: 'Objects', content: objects },
  { slug: 'styles', title: 'Styles', content: styles },
  { slug: 'properties', title: 'Property Types', content: properties },
  { slug: 'export', title: 'Exporting', content: exporting },
  { slug: 'tips', title: 'Tips & Advanced Use', content: tips },
];
