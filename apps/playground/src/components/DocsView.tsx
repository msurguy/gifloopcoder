// Documentation browser: sidebar of pages + Astryx-rendered markdown.
// "Try it" code blocks are opened in the editor via a custom link scheme.

import { Layout, LayoutContent, LayoutPanel, VStack } from '@astryxdesign/core/Layout';
import { Markdown } from '@astryxdesign/core/Markdown';
import { Text } from '@astryxdesign/core/Text';
import { DOC_PAGES } from '../content/docs';
import { navigate } from '../router';

export interface DocsViewProps {
  slug: string;
}

export function DocsView({ slug }: DocsViewProps) {
  const page = DOC_PAGES.find((p) => p.slug === slug) ?? DOC_PAGES[0];

  return (
    <Layout
      start={
        <LayoutPanel hasDivider width={220} role="navigation">
          <VStack gap={1} style={{ padding: 'var(--spacing-3)' }}>
            <Text type="label" color="secondary">
              Documentation
            </Text>
            {DOC_PAGES.map((p) => (
              <a
                key={p.slug}
                href={`#/docs/${p.slug}`}
                style={{
                  textDecoration: 'none',
                  color: p.slug === page.slug ? 'var(--color-text-accent)' : 'var(--color-text-primary)',
                  fontWeight: p.slug === page.slug ? 600 : 400,
                  fontSize: 14,
                  padding: 'var(--spacing-1) var(--spacing-2)',
                  borderRadius: 'var(--radius-inner)',
                  background:
                    p.slug === page.slug
                      ? 'color-mix(in srgb, var(--color-text-accent) 10%, transparent)'
                      : 'transparent',
                }}
              >
                {p.title}
              </a>
            ))}
          </VStack>
        </LayoutPanel>
      }
      content={
        <LayoutContent role="main">
          <div style={{ padding: 'var(--spacing-4)', maxWidth: 860 }} data-testid="docs-content">
            <Markdown
              headingLevelStart={1}
              contentWidth={760}
              onLinkClick={(href) => {
                if (href.startsWith('#/')) {
                  navigate(href.slice(1));
                  return false;
                }
                return undefined as unknown as false;
              }}
            >
              {page.content}
            </Markdown>
          </div>
        </LayoutContent>
      }
    />
  );
}
