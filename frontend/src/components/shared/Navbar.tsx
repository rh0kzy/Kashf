import { Link, useLocation } from 'react-router-dom'

const Navbar = () => {
  const { pathname } = useLocation()

  const links = [
    { path: '/', label: 'Home' },
    { path: '/reader', label: 'Reader' },
    { path: '/detector', label: 'Detector' },
    { path: '/map', label: 'Conflict Map' },
  ]

  return (
    <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
      <span className="text-xl font-bold tracking-widest text-white">KASHF</span>
      <div className="flex gap-6">
        {links.map(link => (
          <Link
            key={link.path}
            to={link.path}
            className={`text-sm tracking-wide transition-colors ${
              pathname === link.path
                ? 'text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}

export default Navbar