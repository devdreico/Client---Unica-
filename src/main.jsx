import { useEffect, useMemo, useState } from 'react'
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Instagram,
  Leaf,
  Menu,
  MessageCircle,
  Minus,
  Moon,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  Sun,
  Trash2,
  X,
} from 'lucide-react'
import { createRoot } from 'react-dom/client'
import logoUrl from '../assets/img/logo-unica-client.png'
import './index.css'

const INSTAGRAM_URL = 'https://www.instagram.com/unica__________________/'
const CATEGORIES = ['Todo', 'Vestidos', 'Enterizos', 'Conjuntos', 'Blusas', 'Bodies']
const formatPrice = (value) => new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
}).format(value)

const productName = (item) => {
  const name = item.title.toLowerCase()
  if (name.includes('manga larga hilo')) return 'Conjunto Hilo'
  if (name.includes('básica awnd')) return 'Básica AWND'
  if (name.includes('buzo licra')) return 'Buzo Americana'
  if (name.includes('destellante')) return 'Body Destellante'
  if (name.includes('vestido disponible')) return 'Vestido Aura'
  if (name.includes('tela qatar')) return 'Blusón Qatar'
  if (name.includes('body alo')) return 'Body Alo'
  if (name.includes('beirut')) return 'Vestido Beirut'
  return item.title
}

function whatsappUrl(message) {
  const number = import.meta.env.VITE_WHATSAPP_NUMBER?.replace(/\D/g, '')
  const recipient = number ? `/${number}` : '/'
  return `https://wa.me${recipient}?text=${encodeURIComponent(message)}`
}

function App() {
  const [catalogue, setCatalogue] = useState([])
  const [theme, setTheme] = useState(() => localStorage.getItem('unica-theme') || 'dark')
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('unica-cart') || '[]')
    } catch {
      return []
    }
  })
  const [activeCategory, setActiveCategory] = useState('Todo')
  const [search, setSearch] = useState('')
  const [archiveCategory, setArchiveCategory] = useState('Todo')
  const [visibleArchive, setVisibleArchive] = useState(20)
  const [selectedItem, setSelectedItem] = useState(null)
  const [selectedPhoto, setSelectedPhoto] = useState(0)
  const [cartOpen, setCartOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    fetch('/catalogo/catalogo.json')
      .then((response) => {
        if (!response.ok) throw new Error('No fue posible cargar el catálogo')
        return response.json()
      })
      .then(setCatalogue)
      .catch(() => setCatalogue([]))
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('unica-theme', theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem('unica-cart', JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    const items = document.querySelectorAll('.reveal:not(.is-visible)')
    if (!('IntersectionObserver' in window)) {
      items.forEach((item) => item.classList.add('is-visible'))
      return undefined
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.1 })
    items.forEach((item) => observer.observe(item))
    return () => observer.disconnect()
  }, [catalogue, activeCategory, archiveCategory, visibleArchive])

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setSelectedItem(null)
        setCartOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const pricedItems = useMemo(() => catalogue.filter((item) => item.price), [catalogue])
  const filteredProducts = useMemo(() => pricedItems.filter((item) => {
    const matchesCategory = activeCategory === 'Todo' || item.category === activeCategory
    return matchesCategory && productName(item).toLowerCase().includes(search.toLowerCase())
  }), [activeCategory, pricedItems, search])
  const archiveItems = useMemo(() => {
    const filtered = catalogue.filter((item) => archiveCategory === 'Todo' || item.category === archiveCategory)
    return filtered.slice(0, visibleArchive)
  }, [archiveCategory, catalogue, visibleArchive])
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0)
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)
  const heroItem = catalogue.find((item) => item.category === 'Enterizos') || catalogue.find((item) => item.category !== 'Colección')

  const addToCart = (item) => {
    const name = productName(item)
    setCart((current) => {
      const existing = current.find((entry) => entry.id === item.id)
      if (existing) {
        return current.map((entry) => entry.id === item.id
          ? { ...entry, quantity: entry.quantity + 1 }
          : entry)
      }
      return [...current, {
        id: item.id,
        title: name,
        price: item.price,
        image: item.photos[0],
        quantity: 1,
      }]
    })
    setSelectedItem(null)
    setCartOpen(true)
  }

  const changeQuantity = (id, amount) => {
    setCart((current) => current
      .map((item) => item.id === id ? { ...item, quantity: item.quantity + amount } : item)
      .filter((item) => item.quantity > 0))
  }

  const checkoutMessage = `Hola, UNICA. Quiero pedir:\n${cart
    .map((item) => `• ${item.title} x${item.quantity} — ${formatPrice(item.price * item.quantity)}`)
    .join('\n')}\n\nTotal de prendas: ${cartCount}\nSubtotal: ${formatPrice(cartTotal)}\n\n¿Me confirman disponibilidad, envío y medios de pago?`

  const openItem = (item) => {
    setSelectedItem(item)
    setSelectedPhoto(0)
  }

  return (
    <div className="site-shell">
      <div className="announcement-bar">
        <span>Medellín, Colombia</span>
        <span className="announcement-separator">✳</span>
        <span>Una forma muy tuya de vestir</span>
        <a href="#coleccion">Descubrir la colección <ArrowRight size={12} /></a>
      </div>

      <header className="site-header glass-panel">
        <a className="brand-mark" href="#inicio" aria-label="UNICA, ir al inicio">
          <img src={logoUrl} alt="UNICA" />
        </a>
        <nav className={`main-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Navegación principal">
          <a onClick={() => setMenuOpen(false)} href="#coleccion">Colección</a>
          <a onClick={() => setMenuOpen(false)} href="#historia">La marca</a>
          <a onClick={() => setMenuOpen(false)} href="#archivo">Archivo</a>
          <a onClick={() => setMenuOpen(false)} href="#instagram">Instagram</a>
        </nav>
        <div className="header-actions">
          <button
            className="icon-button theme-toggle"
            onClick={() => setTheme((value) => value === 'dark' ? 'light' : 'dark')}
            aria-label={theme === 'dark' ? 'Activar tema claro' : 'Activar tema oscuro'}
            title={theme === 'dark' ? 'Tema claro' : 'Tema oscuro'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="cart-trigger" onClick={() => setCartOpen(true)} aria-label={`Abrir carrito, ${cartCount} prendas`}>
            <ShoppingBag size={17} strokeWidth={1.7} />
            <span className="cart-trigger-label">Carrito</span>
            <span className="cart-count">{cartCount}</span>
          </button>
          <button className="icon-button menu-toggle" onClick={() => setMenuOpen((value) => !value)} aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      <main>
        <section className="hero-section page-width" id="inicio">
          <div className="hero-copy reveal">
            <p className="eyebrow"><span className="eyebrow-dot" /> Ropa femenina, hecha para sentir</p>
            <h1>Vestir como<br />se siente <em>ser tú.</em></h1>
            <p className="hero-description">Piezas con carácter para los días que se sienten tuyos. De Medellín para acompañarte donde vayas.</p>
            <div className="hero-cta-row">
              <a className="button button-primary" href="#coleccion">Explorar colección <ArrowUpRight size={16} /></a>
              <a className="text-link" href="#historia">Conoce UNICA <ArrowDown size={14} /></a>
            </div>
            <div className="hero-note"><span>01</span><span>Prendas elegidas, hechas para durar más que un momento.</span></div>
          </div>

          <div className="hero-visual reveal">
            <div className="hero-image-wrap">
              {heroItem?.photos?.[0] && <img src={heroItem.photos[0]} alt={`${heroItem.title}, colección UNICA`} fetchPriority="high" />}
              <div className="hero-image-label glass-panel">
                <span className="hero-label-icon"><Sparkles size={16} /></span>
                <div><strong>Lo nuevo</strong><span>La selección UNICA</span></div>
                <a href="#coleccion" aria-label="Ver lo nuevo"><ArrowUpRight size={18} /></a>
              </div>
            </div>
            <div className="hero-index"><span>01</span><span className="index-line" /><span>COLECCIÓN ACTUAL</span></div>
            <div className="hero-orbit" aria-hidden="true">U</div>
          </div>
          <a className="scroll-hint" href="#coleccion" aria-label="Desplazarse a la colección"><span />Desliza para descubrir</a>
        </section>

        <div className="marquee-strip" aria-label="UNICA · Diseñado en Medellín · Para tu manera de ser">
          <div className="marquee-track" aria-hidden="true">
            {[0, 1].map((copy) => (
              <span className="marquee-copy" key={copy}>
                UNICA <i>✳</i> Vestir sin pedir permiso <i>✳</i> Medellín, Colombia <i>✳</i> Ser tú, siempre <i>✳</i>
              </span>
            ))}
          </div>
        </div>

        <section className="collection-section page-width section-pad" id="coleccion">
          <div className="section-heading reveal">
            <div>
              <p className="eyebrow">Selección UNICA <span className="eyebrow-line" /></p>
              <h2>Lo que te <em>mueve.</em></h2>
              <p className="section-intro">Referencias de la colección, para encontrar esa que habla de ti.</p>
            </div>
            <div className="collection-controls">
              <label className="search-box"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar prenda" aria-label="Buscar prenda" /></label>
              <a className="text-link all-archive-link" href="#archivo">Ver todo el archivo <ArrowUpRight size={14} /></a>
            </div>
          </div>

          <div className="filter-row" role="group" aria-label="Filtrar la colección">
            {CATEGORIES.map((category) => (
              <button key={category} className={`filter-chip ${activeCategory === category ? 'active' : ''}`} onClick={() => setActiveCategory(category)}>{category}</button>
            ))}
          </div>

          {filteredProducts.length ? (
            <div className="product-grid">
              {filteredProducts.map((item, index) => (
                <ProductCard key={item.id} item={item} index={index} onOpen={openItem} />
              ))}
            </div>
          ) : (
            <div className="empty-products"><Search size={23} /><p>{catalogue.length ? 'No encontramos prendas con ese filtro.' : 'Estamos preparando la colección.'}</p><button className="text-link" onClick={() => { setActiveCategory('Todo'); setSearch('') }}>Ver todas</button></div>
          )}
          <p className="price-note"><span>*</span> Precios de referencia tomados de publicaciones de UNICA; disponibilidad y valor final se confirman por WhatsApp.</p>
        </section>

        <section className="quality-band">
          <div className="quality-inner page-width reveal">
            <div className="quality-mark"><Leaf size={22} strokeWidth={1.3} /></div>
            <div className="quality-title"><p className="eyebrow">El cuidado está en los detalles</p><h2>Sentirse bien<br />también es <em>calidad.</em></h2></div>
            <div className="quality-copy"><p>El tacto, la caída, ese ajuste que te deja moverte con libertad. Miramos cada detalle para que la prenda no solo se vea bien: se sienta bien contigo.</p><span>Rib, licra, blonda y más. Cada referencia tiene su propia textura e historia.</span><a className="text-link" href="#archivo">Ver materiales en la colección <ArrowUpRight size={14} /></a></div>
            <span className="quality-watermark" aria-hidden="true">U.</span>
          </div>
        </section>

        <section className="story-section page-width section-pad" id="historia">
          <div className="story-visual reveal">
            <img src={catalogue.find((item) => item.category === 'Vestidos')?.photos?.[0]} alt="Vestido de la colección UNICA" loading="lazy" />
            <span className="story-photo-caption">Medellín, con cariño.</span>
            <div className="story-stamp glass-panel"><span>Hecha</span><strong>para ti</strong><i>✳</i></div>
          </div>
          <div className="story-copy reveal">
            <p className="eyebrow">Una marca de Medellín <span className="eyebrow-line" /></p>
            <h2>No tienes que<br />parecerte a nadie.<br /><em>Ese es el punto.</em></h2>
            <p>UNICA nace de una idea sencilla: vestirte debería acercarte a ti. Por eso elegimos prendas que te invitan a jugar, combinar y sentirte cómoda en tu propia forma de estar en el mundo.</p>
            <p>Somos de Medellín, Colombia. Lo nuestro es la cercanía, el detalle y esa manera tan nuestra de hacer las cosas con intención.</p>
            <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="button button-outline">Conoce nuestra historia <ArrowUpRight size={15} /></a>
          </div>
        </section>

        <section className="archive-section section-pad" id="archivo">
          <div className="page-width">
            <div className="section-heading archive-heading reveal">
              <div><p className="eyebrow">El universo UNICA <span className="eyebrow-line" /></p><h2>Una prenda.<br /><em>Mil maneras.</em></h2><p className="section-intro">Explora las referencias, telas y detalles de nuestra colección.</p></div>
              <div className="archive-aside"><span>{catalogue.length.toString().padStart(2, '0')} referencias</span><span>{catalogue.reduce((total, item) => total + item.photos.length, 0)} fotografías</span></div>
            </div>
            <div className="filter-row archive-filters" role="group" aria-label="Filtrar el archivo">
              {['Todo', 'Vestidos', 'Enterizos', 'Conjuntos', 'Blusas', 'Bodies', 'Faldas'].map((category) => (
                <button key={category} className={`filter-chip ${archiveCategory === category ? 'active' : ''}`} onClick={() => { setArchiveCategory(category); setVisibleArchive(20) }}>{category}</button>
              ))}
            </div>
            {archiveItems.length ? (
              <div className="archive-grid">
                {archiveItems.map((item) => (
                  <button className="archive-card reveal" key={item.id} onClick={() => openItem(item)} aria-label={`Ver fotos de ${item.title}`}>
                    <span className="archive-image"><img src={item.photos[0]} alt={item.title} loading="lazy" /><span className="archive-count">{item.photos.length} {item.photos.length === 1 ? 'foto' : 'fotos'}</span><span className="archive-open"><ArrowUpRight size={16} /></span></span>
                    <span className="archive-meta"><span>{item.category}</span><strong>{item.title}</strong><span>{item.price ? formatPrice(item.price) : 'Consultar disponibilidad'}</span></span>
                  </button>
                ))}
              </div>
            ) : <p className="archive-empty">No hay referencias en esta categoría por ahora.</p>}
            {archiveItems.length < catalogue.filter((item) => archiveCategory === 'Todo' || item.category === archiveCategory).length && (
              <button className="button button-outline archive-more" onClick={() => setVisibleArchive((value) => value + 20)}>Ver más referencias <ArrowDown size={15} /></button>
            )}
          </div>
        </section>

        <section className="instagram-section page-width" id="instagram">
          <div className="instagram-image reveal">
            <img src={catalogue[1]?.photos?.[0] || catalogue[0]?.photos?.[0]} alt="Un look de la colección UNICA" loading="lazy" />
            <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="instagram-image-link" aria-label="Abrir Instagram de UNICA"><Instagram size={20} /><span>unica__________________</span><ArrowUpRight size={16} /></a>
          </div>
          <div className="instagram-copy reveal"><p className="eyebrow"><Instagram size={14} /> Desde Instagram, con amor</p><h2>Nos vestimos<br />como <em>somos.</em></h2><p>Encuentra nuevas referencias, detalles de cada prenda y más inspiración en nuestro Instagram.</p><a className="button button-primary" href={INSTAGRAM_URL} target="_blank" rel="noreferrer">Síguenos en Instagram <ArrowUpRight size={16} /></a></div>
          <span className="instagram-orbit" aria-hidden="true">@</span>
        </section>

        <section className="closing-line page-width"><p>Con cariño, desde Medellín.</p><span>UNICA <i>✳</i> PARA SENTIRTE TÚ</span></section>
      </main>

      <footer className="site-footer">
        <div className="footer-main page-width">
          <div className="footer-brand"><a href="#inicio"><img src={logoUrl} alt="UNICA" /></a><p>Vestir como se siente ser tú.<br />Medellín, Colombia.</p></div>
          <div className="footer-links"><span className="eyebrow">Explora</span><a href="#coleccion">Colección</a><a href="#historia">Nuestra marca</a><a href="#archivo">Archivo</a></div>
          <div className="footer-links"><span className="eyebrow">Hablemos</span><a href={INSTAGRAM_URL} target="_blank" rel="noreferrer">Instagram <ArrowUpRight size={13} /></a><a href={whatsappUrl('Hola, UNICA. Quisiera conocer más de sus prendas.')} target="_blank" rel="noreferrer">WhatsApp <ArrowUpRight size={13} /></a></div>
          <div className="footer-note"><span>UNICA / EST. MEDELLÍN</span><p>Vestirte también puede ser una forma de volver a ti.</p><button className="back-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Volver al inicio"><ArrowLeft size={17} /></button></div>
        </div>
        <div className="footer-bottom page-width"><span>© UNICA · Medellín, Colombia</span><span>Vestir con intención. Sentir sin permiso.</span></div>
      </footer>

      <CartDrawer
        cart={cart}
        cartOpen={cartOpen}
        setCartOpen={setCartOpen}
        changeQuantity={changeQuantity}
        total={cartTotal}
        count={cartCount}
        checkoutUrl={whatsappUrl(checkoutMessage)}
      />
      {selectedItem && (
        <ProductDialog
          item={selectedItem}
          photoIndex={selectedPhoto}
          setPhotoIndex={setSelectedPhoto}
          onClose={() => setSelectedItem(null)}
          onAdd={() => addToCart(selectedItem)}
          onAsk={() => window.open(whatsappUrl(`Hola, UNICA. Quisiera consultar disponibilidad y precio de ${selectedItem.title}.`), '_blank', 'noopener,noreferrer')}
        />
      )}
    </div>
  )
}

function ProductCard({ item, index, onOpen }) {
  const name = productName(item)
  return (
    <article className="product-card reveal" style={{ '--card-index': index }}>
      <button className="product-image-button" onClick={() => onOpen(item)} aria-label={`Ver ${name}`}>
        <img src={item.photos[0]} alt={name} loading={index < 4 ? 'eager' : 'lazy'} />
        <span className="product-image-count">{item.photos.length} fotos</span>
        <span className="product-image-arrow"><ArrowUpRight size={17} /></span>
      </button>
      <div className="product-info">
        <div className="product-info-top"><span>{item.category}</span><span className="product-price">{formatPrice(item.price)}</span></div>
        <button className="product-name" onClick={() => onOpen(item)}>{name}</button>
        <button className="product-add" onClick={() => onOpen(item)} aria-label={`Ver opciones de ${name}`}><span>Ver prenda</span><ArrowRight size={15} /></button>
      </div>
    </article>
  )
}

function ProductDialog({ item, photoIndex, setPhotoIndex, onClose, onAdd, onAsk }) {
  const hasPrice = Boolean(item.price)
  const photo = item.photos[photoIndex] || item.photos[0]
  const step = (direction) => setPhotoIndex((value) => (value + direction + item.photos.length) % item.photos.length)
  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <section className="product-dialog glass-panel" role="dialog" aria-modal="true" aria-label={`Detalles de ${productName(item)}`} onClick={(event) => event.stopPropagation()}>
        <button className="icon-button dialog-close" onClick={onClose} aria-label="Cerrar detalle"><X size={20} /></button>
        <div className="dialog-image"><img src={photo} alt={`${item.title}, foto ${photoIndex + 1}`} />
          {item.photos.length > 1 && <><button className="photo-nav previous" onClick={() => step(-1)} aria-label="Foto anterior"><ChevronLeft size={20} /></button><button className="photo-nav next" onClick={() => step(1)} aria-label="Foto siguiente"><ChevronRight size={20} /></button></>}
          <span className="dialog-photo-number">{String(photoIndex + 1).padStart(2, '0')} / {String(item.photos.length).padStart(2, '0')}</span>
        </div>
        <div className="dialog-copy"><p className="eyebrow">{item.category} <span className="eyebrow-line" /></p><h2>{hasPrice ? productName(item) : item.title}</h2><p className="dialog-description">Una referencia UNICA para vestirla a tu manera. Escríbenos y te contamos disponibilidad, materiales y detalles de la prenda.</p>{hasPrice ? <><strong className="dialog-price">{formatPrice(item.price)}</strong><span className="dialog-note">Precio de referencia · confirma disponibilidad por WhatsApp</span></> : <strong className="dialog-price dialog-consult">Consulta su disponibilidad</strong>}
          <div className="dialog-actions">{hasPrice ? <button className="button button-primary" onClick={onAdd}>Agregar al carrito <ShoppingBag size={16} /></button> : <button className="button button-primary" onClick={onAsk}>Consultar por WhatsApp <MessageCircle size={16} /></button>}<button className="text-link dialog-instagram" onClick={() => window.open(INSTAGRAM_URL, '_blank', 'noopener,noreferrer')}>Ver en Instagram <ArrowUpRight size={14} /></button></div>
        </div>
      </section>
    </div>
  )
}

function CartDrawer({ cart, cartOpen, setCartOpen, changeQuantity, total, count, checkoutUrl }) {
  if (!cartOpen) return null
  return (
    <div className="drawer-backdrop" onClick={() => setCartOpen(false)} role="presentation">
      <aside className="cart-drawer glass-panel" role="dialog" aria-modal="true" aria-label="Tu carrito" onClick={(event) => event.stopPropagation()}>
        <div className="drawer-header"><div><p className="eyebrow">Tu selección</p><h2>El carrito <em>UNICA.</em></h2></div><button className="icon-button" onClick={() => setCartOpen(false)} aria-label="Cerrar carrito"><X size={20} /></button></div>
        {cart.length ? <>
          <div className="cart-items">{cart.map((item) => <article className="cart-item" key={item.id}><img src={item.image} alt={item.title} /><div className="cart-item-copy"><span className="eyebrow">UNICA · Selección</span><strong>{item.title}</strong><span className="cart-item-price">{formatPrice(item.price)}</span><div className="quantity-control"><button onClick={() => changeQuantity(item.id, -1)} aria-label={`Quitar una unidad de ${item.title}`}><Minus size={13} /></button><span>{item.quantity}</span><button onClick={() => changeQuantity(item.id, 1)} aria-label={`Agregar una unidad de ${item.title}`}><Plus size={13} /></button></div></div><button className="remove-item" onClick={() => changeQuantity(item.id, -item.quantity)} aria-label={`Eliminar ${item.title}`}><Trash2 size={16} /></button></article>)}</div>
          <div className="cart-summary"><div><span>Prendas</span><span>{count}</span></div><div className="cart-total"><span>Subtotal de referencia</span><strong>{formatPrice(total)}</strong></div><p>El envío y la disponibilidad se confirman por WhatsApp antes de finalizar.</p><a className="button button-primary checkout-button" href={checkoutUrl} target="_blank" rel="noreferrer"><MessageCircle size={17} /> Continuar por WhatsApp <ArrowUpRight size={15} /></a><button className="continue-shopping" onClick={() => setCartOpen(false)}>Seguir explorando <ArrowRight size={14} /></button></div>
        </> : <div className="cart-empty"><span><ShoppingBag size={22} /></span><h3>Tu próxima prenda<br /><em>empieza aquí.</em></h3><p>Descubre la colección y guarda lo que te hace sentir tú.</p><button className="button button-primary" onClick={() => setCartOpen(false)}>Explorar colección <ArrowRight size={15} /></button></div>}
      </aside>
    </div>
  )
}

export default App

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('No se encontró el elemento raíz de UNICA.')
createRoot(rootElement).render(<App />)