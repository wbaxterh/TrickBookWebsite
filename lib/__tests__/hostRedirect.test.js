const config = require('../../next.config.js');

describe('canonical host redirect', () => {
  it('sends www to the apex permanently and keeps the path', async () => {
    const rules = await config.redirects();
    const www = rules.find((rule) =>
      rule.has?.some((h) => h.type === 'host' && h.value === 'www.thetrickbook.com'),
    );
    expect(www).toBeDefined();
    expect(www.permanent).toBe(true);
    expect(www.source).toBe('/:path*');
    expect(www.destination).toBe('https://thetrickbook.com/:path*');
  });

  it('has exactly one host rule so the apex can never loop', async () => {
    const rules = await config.redirects();
    const hostRules = rules.filter((rule) => rule.has?.some((h) => h.type === 'host'));
    expect(hostRules).toHaveLength(1);
    expect(hostRules[0].has[0].value).not.toBe('thetrickbook.com');
  });
});
