import { Box, Button } from '@mui/material';
import { useRouter } from 'next/router';

export default function AdminNav() {
  const router = useRouter();
  const currentPath = router.pathname;

  const navItems = [
    { label: 'Dashboard', path: '/admin' },
    { label: 'Categories', path: '/admin/categories' },
    { label: 'Trickipedia', path: '/admin/trickipedia' },
    { label: 'Spots', path: '/admin/spots' },
    { label: 'Pending Spots', path: '/admin/pending-spots' },
    { label: 'Blog', path: '/admin/blog' },
    { label: 'The Couch', path: '/admin/couch' },
    { label: 'Analytics', path: '/admin/analytics' },
  ];

  const isActive = (path) =>
    path === '/admin' ? currentPath === '/admin' : currentPath.startsWith(path);

  return (
    <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      {navItems.map((item) => {
        const active = isActive(item.path);
        return (
          <Button
            key={item.path}
            variant={active ? 'contained' : 'outlined'}
            onClick={() => router.push(item.path)}
            sx={{
              minWidth: '120px',
              backgroundColor: active ? '#FCF150' : 'transparent',
              color: '#1f1f1f',
              borderColor: '#FCF150',
              '&:hover': {
                backgroundColor: '#FCF150',
                color: '#1f1f1f',
              },
            }}
          >
            {item.label}
          </Button>
        );
      })}
    </Box>
  );
}
