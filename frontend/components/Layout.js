import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  HomeIcon, 
  PlayIcon, 
  TagIcon, 
  TvIcon 
} from '@heroicons/react/24/outline';

const Layout = ({ children }) => {
  const router = useRouter();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Playlists', href: '/playlists', icon: PlayIcon },
    { name: 'Categories', href: '/categories', icon: TagIcon },
    { name: 'Channels', href: '/channels', icon: TvIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-gray-900">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 bg-gray-800">
            <h1 className="text-xl font-bold text-white">Serhat M3U Admin</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigation.map((item) => {
              const isActive = router.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors
                    ${isActive 
                      ? 'bg-gray-800 text-white' 
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }
                  `}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;