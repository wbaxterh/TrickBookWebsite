import Cookies from 'js-cookie';
import { Check, Globe } from 'lucide-react';
import { useRouter } from 'next/router';
import NavDropdown from 'react-bootstrap/NavDropdown';

// Languages are shown in their own language (endonyms), so this list is
// intentionally not translated. Keep in sync with next-i18next.config.js.
export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'pt-BR', label: 'Português (Brasil)' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'it', label: 'Italiano' },
  { code: 'zh-CN', label: '简体中文' },
  { code: 'zh-TW', label: '繁體中文' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'ar', label: 'العربية' },
  { code: 'ru', label: 'Русский' },
];

const LanguageSelector = ({ onSelect }) => {
  const router = useRouter();
  const currentLanguage = LANGUAGES.find(({ code }) => code === router.locale) || LANGUAGES[0];

  const changeLanguage = (code) => {
    onSelect?.();
    if (code === router.locale) return;
    // Persist the choice so Next.js locale detection honors it on future visits.
    Cookies.set('NEXT_LOCALE', code, { expires: 365, path: '/' });
    const { pathname, query, asPath } = router;
    router.push({ pathname, query }, asPath, { locale: code, scroll: false });
  };

  return (
    <NavDropdown
      align="end"
      className="language-selector"
      id="language-selector-dropdown"
      title={
        <span className="language-selector-title">
          <Globe size={18} aria-hidden="true" />
          <span className="language-selector-label">{currentLanguage.label}</span>
        </span>
      }
    >
      {LANGUAGES.map(({ code, label }) => (
        <NavDropdown.Item
          key={code}
          active={code === currentLanguage.code}
          lang={code}
          onClick={() => changeLanguage(code)}
          style={{ display: 'flex', alignItems: 'center', gap: 10 }}
        >
          <span style={{ width: 18, display: 'inline-flex' }}>
            {code === currentLanguage.code && <Check size={16} aria-hidden="true" />}
          </span>
          {label}
        </NavDropdown.Item>
      ))}
    </NavDropdown>
  );
};

export default LanguageSelector;
