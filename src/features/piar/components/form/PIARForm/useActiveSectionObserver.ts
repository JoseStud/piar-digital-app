import { useEffect, useState } from 'react';

export function useActiveSectionObserver(sectionIds: readonly string[]): string {
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      return;
    }

    let sectionObserver: IntersectionObserver | null = null;
    let mountObserver: MutationObserver | null = null;

    const observeSections = () => {
      const sectionEls = sectionIds
        .map((sectionId) => document.getElementById(`section-${sectionId}`))
        .filter((el): el is HTMLElement => el !== null);

      if (sectionEls.length === 0) {
        return false;
      }

      sectionObserver?.disconnect();
      sectionObserver = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              const id = entry.target.id.replace('section-', '');
              setActiveSection(id);
            }
          }
        },
        { threshold: 0.3 },
      );

      for (const el of sectionEls) {
        sectionObserver.observe(el);
      }

      return true;
    };

    if (!observeSections() && typeof MutationObserver !== 'undefined') {
      mountObserver = new MutationObserver(() => {
        if (observeSections()) {
          mountObserver?.disconnect();
          mountObserver = null;
        }
      });

      mountObserver.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      sectionObserver?.disconnect();
      mountObserver?.disconnect();
    };
  }, [sectionIds]);

  return activeSection;
}
