export default function SnowboardFilmsRedirect() {
  return null;
}

export function getServerSideProps() {
  return {
    redirect: {
      destination: '/media?tab=couch&sport=snowboarding',
      permanent: true,
    },
  };
}
