import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-darker border-t border-white/10 mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-black gradient-text mb-4">
              PLUGS CRTFS
            </h3>
            <p className="text-gray-400 mb-4">
              La plateforme de référence pour trouver des vendeurs certifiés et de confiance.
            </p>
            <div className="flex gap-4">
              <a href="https://t.me/PLGSCRTF_BOT" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.56c-.21 2.2-1.11 7.53-1.57 9.98-.19 1.04-.57 1.39-.94 1.42-.8.07-1.41-.53-2.18-1.03-1.21-.79-1.9-1.28-3.07-2.05-1.36-.9-.48-1.39.3-2.2.2-.21 3.7-3.38 3.77-3.67.01-.04.01-.17-.06-.25-.08-.08-.19-.05-.27-.03-.12.02-1.96 1.25-5.54 3.66-.52.36-1.0.54-1.43.52-.47-.02-1.37-.27-2.04-.48-.82-.27-1.48-.41-1.42-.87.03-.24.36-.49 1.0-.75 3.9-1.7 6.51-2.82 7.82-3.36 3.73-1.53 4.5-1.8 5.01-1.81.11 0 .36.03.52.17.14.12.18.28.2.44-.01.05.01.14 0 .22z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4 text-white">Navigation</h4>
            <ul className="space-y-2">
              <li><Link href="/plugs" className="text-gray-400 hover:text-white transition-colors">Tous les Plugs</Link></li>
              <li><Link href="/search" className="text-gray-400 hover:text-white transition-colors">Rechercher</Link></li>
              <li><Link href="/social" className="text-gray-400 hover:text-white transition-colors">Réseaux sociaux</Link></li>
              <li><Link href="/config" className="text-gray-400 hover:text-white transition-colors">Admin</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4 text-white">Contact</h4>
            <ul className="space-y-2">
              <li className="text-gray-400">
                <a href="https://t.me/PLGSCRTF_BOT" className="hover:text-white transition-colors">
                  @PLGSCRTF_BOT
                </a>
              </li>
              <li className="text-gray-400">Support 24/7</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 PLUGS CRTFS. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  )
}