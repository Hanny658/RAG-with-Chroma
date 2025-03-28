import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Cookies from 'js-cookie';

import ViewAll from '../components/ViewAll';
import BatchAdd from '../components/BatchAdd';
import Configurations from '../components/Configurations';

type Tab = 'view' | 'add' | 'config';

const MainPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('view');
  const [searchParams, setSearchParams] = useSearchParams();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = Cookies.get('user');
    if (!user) {
      navigate('/');
    }

    const tab = searchParams.get('tab') as Tab;
  if (tab === 'add' || tab === 'config' || tab === 'view') {
    setActiveTab(tab);
  }
  }, [navigate, searchParams]);

  const handleLogout = () => {
    Cookies.remove('user');
    navigate('/');
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
    setMenuOpen(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'view':
        return <ViewAll />;
      case 'add':
        return <BatchAdd />;
      case 'config':
        return <Configurations />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-white">
      <header className="bg-gradient-to-b from-sky-200 to-blue-400 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <img
            src="/CUTE.png"
            alt="Logo"
            className="h-10 cursor-pointer"
            onClick={() => handleTabChange('view')}
          />

          <div className="sm:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="focus:outline-none"
              aria-label="Toggle Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                />
              </svg>
            </button>
          </div>

          <nav className="hidden sm:flex space-x-4 text-sm sm:text-base font-medium items-center">
            <button
              onClick={() => handleTabChange('view')}
              className={`px-3 py-1 rounded transition bg-transparent border-transparent ${
                activeTab === 'view' ? '!font-bold text-blue-600' : 'text-gray-700'
              }`}
            >
              View All
            </button>
            <button
              onClick={() => handleTabChange('add')}
              className={`px-3 py-1 rounded transition bg-transparent border-transparent ${
                activeTab === 'add' ? '!font-bold text-blue-600' : 'text-gray-700'
              }`}
            >
              Add Records
            </button>
            <button
              onClick={() => handleTabChange('config')}
              className={`px-3 py-1 rounded transition bg-transparent border-transparent ${
                activeTab === 'config' ? '!font-bold text-blue-600' : 'text-gray-700'
              }`}
            >
              Configuration
            </button>
            <button
              onClick={handleLogout}
              className="ml-4 text-red-600"
            >
              Log out
            </button>
          </nav>
        </div>

        {menuOpen && (
          <div className="sm:hidden px-4 pb-4 space-y-2">
            <button
              onClick={() => handleTabChange('view')}
              className={`block w-full text-left px-3 py-2 rounded transition bg-transparent border-transparent ${
                activeTab === 'view' ? '!font-bold text-blue-600' : 'text-gray-700'
              }`}
            >
              View All
            </button>
            <button
              onClick={() => handleTabChange('add')}
              className={`block w-full text-left px-3 py-2 rounded transition bg-transparent border-transparent ${
                activeTab === 'add' ? '!font-bold text-blue-600' : 'text-gray-700'
              }`}
            >
              Add Records
            </button>
            <button
              onClick={() => handleTabChange('config')}
              className={`block w-full text-left px-3 py-2 rounded transition bg-transparent border-transparent ${
                activeTab === 'config' ? '!font-bold text-blue-600' : 'text-gray-700'
              }`}
            >
              Configuration
            </button>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-3 py-2 text-red-600"
            >
              Log out
            </button>
          </div>
        )}
      </header>

      <main className="flex-1 overflow-auto px-4 py-6 sm:px-8 sm:py-8">
        <div className="max-w-7xl mx-auto">{renderContent()}</div>
      </main>
    </div>
  );
};

export default MainPage;
