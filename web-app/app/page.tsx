export default function Home() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#000', 
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '2rem' }}>🔌 PLUGS CRTFS</h1>
      <p style={{ fontSize: '1.5rem', marginBottom: '3rem' }}>La marketplace exclusive des vendeurs certifiés</p>
      
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <a href="/plugs" style={{
          padding: '1rem 2rem',
          backgroundColor: '#007aff',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '0.5rem',
          fontSize: '1.1rem'
        }}>
          🔌 Voir les Plugs
        </a>
        
        <a href="https://t.me/PLGSCRTF_BOT" style={{
          padding: '1rem 2rem',
          backgroundColor: '#333',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '0.5rem',
          fontSize: '1.1rem'
        }}>
          🤖 Ouvrir le Bot
        </a>
      </div>
      
      <div style={{ marginTop: '4rem', textAlign: 'center' }}>
        <p style={{ opacity: 0.7 }}>© 2024 PLUGS CRTFS. Tous droits réservés.</p>
      </div>
    </div>
  )
}
