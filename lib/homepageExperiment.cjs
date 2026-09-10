const EXPERIMENT = 'homepage-design-v1';
const COOKIE = 'tb_homepage_v1';
const VARIANTS = ['control', 'progression'];

// Pure allocation policy: previews never enroll visitors; production starts switched off.
function chooseHomepage({
  preview,
  enabled,
  locale = 'en',
  cookie,
  requested,
  bucket,
  percentage = 50,
}) {
  if (preview)
    return {
      name: EXPERIMENT,
      variant: VARIANTS.includes(requested) ? requested : 'progression',
      mode: 'preview',
      setCookie: false,
    };
  if (!enabled || locale !== 'en')
    return { name: EXPERIMENT, variant: 'control', mode: 'off', setCookie: false };
  if (VARIANTS.includes(cookie))
    return { name: EXPERIMENT, variant: cookie, mode: 'experiment', setCookie: false };
  const weight = Number(percentage);
  const safeWeight = Number.isFinite(weight) ? Math.min(100, Math.max(0, weight)) : 50;
  return {
    name: EXPERIMENT,
    variant: bucket < safeWeight ? 'progression' : 'control',
    mode: 'experiment',
    setCookie: true,
  };
}

module.exports = { COOKIE, EXPERIMENT, chooseHomepage };
