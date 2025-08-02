import { cookies } from 'next/headers'

export default async function InitialSplash() {
  const cookieStore = cookies()
  const hasVisited = cookieStore.get('hasVisited')
  
  // Si l'utilisateur a déjà visité, ne pas afficher
  if (hasVisited) {
    return null
  }
  
  // Récupérer l'image de fond
  let backgroundImage = ''
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/settings`, {
      cache: 'no-store'
    })
    if (response.ok) {
      const settings = await response.json()
      backgroundImage = settings.backgroundImage || ''
    }
  } catch (error) {
    console.error('Error fetching background:', error)
  }
  
  return (
    <>
      <style jsx global>{`
        body {
          overflow: hidden !important;
        }
      `}</style>
      <div 
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
        id="initial-splash"
        style={{
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Overlay sombre */}
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6">
            Bienvenu(e)s sur <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">PLUGS CRTFS</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90">
            Trouvez votre plugs près de chez vous 🔌
          </p>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{
        __html: `
          // Cacher le splash après 6 secondes
          setTimeout(function() {
            const splash = document.getElementById('initial-splash');
            if (splash) {
              splash.style.transition = 'opacity 0.5s';
              splash.style.opacity = '0';
              setTimeout(function() {
                splash.remove();
                document.body.style.overflow = '';
                // Marquer comme visité
                document.cookie = 'hasVisited=true; path=/; max-age=86400';
              }, 500);
            }
          }, 6000);
        `
      }} />
    </>
  )
}