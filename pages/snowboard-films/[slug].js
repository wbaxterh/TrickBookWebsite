export default function SnowboardFilmRedirect() {
  return null;
}

export function getServerSideProps({ params }) {
  return {
    redirect: {
      destination: `/media/couch/${encodeURIComponent(params.slug)}`,
      permanent: true,
    },
  };
}
