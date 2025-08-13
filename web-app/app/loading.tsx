export default function Loading() {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
    >
      {/* Contenu */}
      <div className="relative z-10 text-center px-4">
        <h1 className="text-4xl md:text-6xl font-black text-white mb-6">
          Bienvenu(e)s sur <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">CERTIF2PLUG</span>
        </h1>
        <p className="text-xl md:text-2xl text-white/90">
          Trouvez votre plugs près de chez vous 🔌
        </p>
      </div>
    </div>
  )
}