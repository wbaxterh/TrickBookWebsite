export default function RobotsTxt() {
  return null;
}

export async function getServerSideProps({ res }) {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.write(
    ['User-agent: *', 'Allow: /', '', 'Sitemap: https://thetrickbook.com/sitemap.xml', ''].join(
      '\n',
    ),
  );
  res.end();
  return { props: {} };
}
