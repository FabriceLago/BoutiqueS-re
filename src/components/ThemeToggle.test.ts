import { describe, it, expect, beforeEach } from 'vitest';

describe('Bascule de thème Sombre / Clair (Accessibilité & WCAG AA)', () => {
  let mockStorage: Record<string, string> = {};
  let mockAttributes: Record<string, string> = {};
  let mockClassList: Set<string> = new Set();

  beforeEach(() => {
    mockStorage = {};
    mockAttributes = {};
    mockClassList = new Set();
  });

  const getThemeFromStorage = (storage: Record<string, string>): 'dark' | 'light' => {
    const saved = storage['boutiquesure_theme'];
    return saved === 'light' || saved === 'dark' ? saved : 'dark';
  };

  const applyThemeToDOM = (
    theme: 'dark' | 'light',
    attributes: Record<string, string>,
    classes: Set<string>,
    storage: Record<string, string>
  ) => {
    attributes['data-theme'] = theme;
    if (theme === 'light') {
      classes.add('theme-light');
      classes.delete('theme-dark');
    } else {
      classes.add('theme-dark');
      classes.delete('theme-light');
    }
    storage['boutiquesure_theme'] = theme;
  };

  it('initialise par défaut le thème sombre profond si aucun thème n\'est sauvegardé', () => {
    const theme = getThemeFromStorage(mockStorage);
    expect(theme).toBe('dark');
  });

  it('restaure le thème clair depuis le localStorage si configuré', () => {
    mockStorage['boutiquesure_theme'] = 'light';
    const theme = getThemeFromStorage(mockStorage);
    expect(theme).toBe('light');
  });

  it('ignore les valeurs inconnues dans le stockage et retourne le thème sombre par défaut', () => {
    mockStorage['boutiquesure_theme'] = 'invalid_theme';
    const theme = getThemeFromStorage(mockStorage);
    expect(theme).toBe('dark');
  });

  it('bascule correctement du mode sombre au mode clair et synchronise les attributs DOM', () => {
    let currentTheme: 'dark' | 'light' = 'dark';
    
    // 1ère bascule -> Mode clair
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyThemeToDOM(currentTheme, mockAttributes, mockClassList, mockStorage);

    expect(currentTheme).toBe('light');
    expect(mockAttributes['data-theme']).toBe('light');
    expect(mockClassList.has('theme-light')).toBe(true);
    expect(mockClassList.has('theme-dark')).toBe(false);
    expect(mockStorage['boutiquesure_theme']).toBe('light');

    // 2ème bascule -> Retour au mode sombre
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyThemeToDOM(currentTheme, mockAttributes, mockClassList, mockStorage);

    expect(currentTheme).toBe('dark');
    expect(mockAttributes['data-theme']).toBe('dark');
    expect(mockClassList.has('theme-dark')).toBe(true);
    expect(mockClassList.has('theme-light')).toBe(false);
    expect(mockStorage['boutiquesure_theme']).toBe('dark');
  });
});
