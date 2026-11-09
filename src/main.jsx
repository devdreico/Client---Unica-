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
  Sun,
  Trash2,
  X,
} from 'lucide-react'
import { createRoot } from 'react-dom/client'
import logoUrl from '../assets/img/logo-unica-client.png'
import './index.css'
import './monochrome.css'

const INSTAGRAM_URL = 'https://www.instagram.com/unica__________________/'
const CATEGORIES = ['Todo', 'Vestidos', 'Enterizos', 'Conjuntos', 'Blusas', 'Bodies', 'Moda']
const FEATURED_IDS = ['ref-100', 'ref-057', 'ref-013', 'ref-039', 'ref-074', 'ref-055', 'ref-084', 'ref-005']
const formatPrice = (value) => new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
}).format(value)

const productName = (item) => {
  return item.title
}

const productDetails = (item) => {
  const details = item.details?.slice(0, 2) || []
  if (item.colors?.length && details.length < 2) details.push(`Colores: ${item.colors.join(', ')}`)
  return details.join(' · ') || 'Detalles por confirmar'
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
  const [heroSlide, setHeroSlide] = useState(0)
  const [introPhase, setIntroPhase] = useState('entering')

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
    const leaveTimer = window.setTimeout(() => setIntroPhase('leaving'), 780)
    const finishTimer = window.setTimeout(() => setIntroPhase('done'), 1120)
    return () => {
      window.clearTimeout(leaveTimer)
      window.clearTimeout(finishTimer)
    }
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('unica-theme', theme)
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#080808' : '#ffffff')
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
  const featuredProducts = useMemo(() => FEATURED_IDS
    .map((id) => pricedItems.find((item) => item.id === id))
    .filter(Boolean), [pricedItems])
  const heroSlides = featuredProducts.slice(0, 4)
  const heroItem = heroSlides[heroSlide % Math.max(heroSlides.length, 1)]

  useEffect(() => {
    if (heroSlides.length < 2) return undefined
    const interval = window.setInterval(() => {
      setHeroSlide((current) => (current + 1) % heroSlides.length)
    }, 5600)
    return () => window.clearInterval(interval)
  }, [heroSlides.length])

  const addToCart = (item, variants = {}) => {
    const name = productName(item)
    const variant = [variants.size, variants.color && `Color ${variants.color}`].filter(Boolean).join(' · ')
    const lineId = `${item.id}-${variant || 'estandar'}`
    setCart((current) => {
      const existing = current.find((entry) => entry.id === lineId)
      if (existing) {
        return current.map((entry) => entry.id === lineId
          ? { ...entry, quantity: entry.quantity + 1 }
          : entry)
      }
      return [...current, {
        id: lineId,
        title: name,
        price: item.price,
        image: item.photos[0],
        variant,
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

  const checkoutMessage = `Hola, UNICA. Quiero pedir estas prendas:\n${cart
    .map((item) => `• ${item.title}${item.variant ? ` · ${item.variant}` : ''} x${item.quantity} — ${formatPrice(item.price * item.quantity)}`)
    .join('\n')}\n\nPrendas: ${cartCount}\nSubtotal: ${formatPrice(cartTotal)}\n\n¿Me confirman disponibilidad, envío y medios de pago? ¡Gracias!`

  const openItem = (item) => {
    setSelectedItem(item)
    setSelectedPhoto(0)
  }

  return (
    <div className="site-shell">
      {introPhase !== 'done' && (
        <div className={`brand-intro ${introPhase}`} role="status" aria-label="UNICA, moda colombiana desde Medellín">
          <span className="intro-location">MEDELLÍN · COLOMBIA</span>
          <span className="intro-word" aria-hidden="true">{'UNICA'.split('').map((letter, index) => <span key={letter} style={{ '--letter-index': index }}>{letter}</span>)}</span>
          <span className="intro-progress"><span /></span>
          <span className="intro-caption">MODA DE AQUÍ · ESTILO PROPIO</span>
        </div>
      )}
      <div className="announcement-bar">
        <span>De Medellín, Colombia</span>
        <span className="announcement-separator">/</span>
        <span>MODA COLOMBIANA · ESTILO PROPIO</span>
        <a href="#coleccion">Viste lo nuestro <ArrowRight size={14} /></a>
      </div>

      <header className="site-header glass-panel">
        <a className="brand-mark" href="#inicio" aria-label="UNICA, ir al inicio">
          <img src={logoUrl} alt="UNICA" />
        </a>
        <nav className={`main-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Navegación principal">
          <a onClick={() => setMenuOpen(false)} href="#coleccion">Colección</a>
          <a onClick={() => setMenuOpen(false)} href="#historia">Nuestra raíz</a>
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
            <p className="eyebrow"><span className="eyebrow-dot" /> ORGULLO COLOMBIANO · MODA EN MEDELLÍN</p>
            <h1>De Medellín,<br />para vestir <em>Colombia.</em></h1>
            <p className="hero-description">Moda con carácter, nacida en Medellín. Elige tu próximo look y lleva tu estilo a tu manera, estés donde estés.</p>
            <div className="hero-cta-row">
              <a className="button button-primary" href="#coleccion">Comprar moda colombiana <ArrowUpRight size={18} /></a>
              <a className="text-link" href="#historia">Conoce nuestra raíz <ArrowDown size={16} /></a>
            </div>
            <div className="hero-note"><span>{String(heroSlide + 1).padStart(2, '0')} / {String(Math.max(heroSlides.length, 4)).padStart(2, '0')}</span><span>Estilo con origen colombiano</span></div>
          </div>

          <div className="hero-visual reveal">
            <div className="hero-image-wrap">
              {heroItem?.photos?.[0] && <img key={heroItem.id} src={heroItem.photos[0]} alt={`${heroItem.title}, ${heroItem.category.toLowerCase()} de UNICA`} fetchPriority="high" />}
              <div className="hero-image-label glass-panel">
                <span className="hero-label-icon">0{heroSlide + 1}</span>
                <div><strong>{heroItem?.title || 'Moda UNICA'}</strong><span>{heroItem?.category || 'Colección'}{heroItem?.price ? ` · ${formatPrice(heroItem.price)}` : ''}</span></div>
                <a href="#coleccion" aria-label="Ver esta prenda"><ArrowUpRight size={20} /></a>
              </div>
            </div>
            <div className="hero-index"><span>UNICA</span><span className="index-line" /><span>ESTILO COLOMBIANO</span></div>
            <div className="hero-pagination" aria-label="Selección destacada">
              {heroSlides.map((item, index) => <button key={item.id} className={index === heroSlide ? 'active' : ''} onClick={() => setHeroSlide(index)} aria-label={`Ver ${item.title}`} />)}
            </div>
          </div>
          <a className="scroll-hint" href="#coleccion" aria-label="Ver la moda de UNICA"><span />Descubre la colección</a>
        </section>

        <section className="collection-section page-width section-pad" id="coleccion">
          <div className="section-heading reveal">
            <div>
              <p className="eyebrow">01 / ORGULLO QUE SE VISTE <span className="eyebrow-line" /></p>
              <h2>Moda de aquí.<br /><em>Estilo propio.</em></h2>
              <p className="section-intro">Descubre prendas de una marca nacida en Medellín y encuentra la que va contigo.</p>
            </div>
            <div className="collection-controls">
              <label className="search-box"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Busca tu próximo look" aria-label="Buscar prendas de UNICA" /></label>
              <a className="text-link all-archive-link" href="#archivo">Descubre más moda <ArrowUpRight size={14} /></a>
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
                <ProductCard key={item.id} item={item} index={index} onOpen={openItem} onAdd={() => addToCart(item)} />
              ))}
            </div>
          ) : (
            <div className="empty-products"><Search size={23} /><p>{catalogue.length ? 'No encontramos prendas con ese filtro.' : 'Estamos preparando la colección.'}</p><button className="text-link" onClick={() => { setActiveCategory('Todo'); setSearch('') }}>Ver todas</button></div>
          )}
          <p className="price-note"><span>*</span> Valores compartidos en publicaciones de UNICA; confirma precio y disponibilidad antes de pedir.</p>
        </section>

        <div className="marquee-strip" aria-label="UNICA · Moda colombiana · Desde Medellín">
          <div className="marquee-track" aria-hidden="true">
            {[0, 1].map((copy) => <span className="marquee-copy" key={copy}>MODA DE AQUÍ <i>✳</i> MEDELLÍN, COLOMBIA <i>✳</i> ORGULLO QUE SE VISTE <i>✳</i> ESTILO PROPIO <i>✳</i></span>)}
          </div>
        </div>

        <section className="quality-band">
          <div className="quality-inner page-width reveal">
            <div className="quality-mark"><Leaf size={22} strokeWidth={1.3} /></div>
            <div className="quality-title"><p className="eyebrow">EL ORIGEN TAMBIÉN SE VISTE</p><h2>De aquí.<br />Con orgullo.<br /><em>Con estilo.</em></h2></div>
            <div className="quality-copy"><p>Desde Medellín celebramos la moda que se lleva con identidad. Cada ficha muestra las fotos y los detalles publicados para que elijas con confianza.</p><span>¿Quieres saber más sobre una prenda? Nuestro equipo te confirma disponibilidad y características por WhatsApp.</span><a className="text-link" href="#archivo">Conoce cada referencia <ArrowUpRight size={16} /></a></div>
            <span className="quality-watermark" aria-hidden="true">U.</span>
          </div>
        </section>

        <section className="story-section page-width section-pad" id="historia">
          <div className="story-visual reveal">
            <img src={catalogue.find((item) => item.category === 'Vestidos')?.photos?.[0]} alt="Vestido de la colección UNICA" loading="lazy" />
            <span className="story-photo-caption">Medellín, Colombia</span>
            <div className="story-stamp glass-panel"><span>Hecha</span><strong>para ti</strong><i>✳</i></div>
          </div>
          <div className="story-copy reveal">
            <p className="eyebrow">02 / NUESTRA RAÍZ <span className="eyebrow-line" /></p>
            <h2>Nacida en Medellín.<br />Pensada para vestir<br /><em>a tu manera.</em></h2>
            <p>UNICA es una marca colombiana con raíz en Medellín, una ciudad que vive la moda con creatividad, carácter y movimiento.</p>
            <p>Desde aquí compartimos una selección para todo el país: prendas para celebrar tu identidad y construir tu propio estilo, sin uniformes.</p>
            <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="button button-outline">Descubre la marca colombiana <ArrowUpRight size={17} /></a>
          </div>
        </section>

        <section className="archive-section section-pad" id="archivo">
          <div className="page-width">
            <div className="section-heading archive-heading reveal">
              <div><p className="eyebrow">03 / MODA HECHA PARA EXPRESARTE <span className="eyebrow-line" /></p><h2>Colombia se viste<br /><em>a su manera.</em></h2><p className="section-intro">Busca tu próxima prenda entre nuestras referencias y explora todos sus detalles.</p></div>
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

        <section className="closing-line page-width"><p>Con orgullo, desde Medellín para Colombia.</p><span>UNICA <i>✳</i> MODA DE AQUÍ</span></section>
      </main>

      <footer className="site-footer">
        <div className="footer-main page-width">
          <div className="footer-brand"><a href="#inicio"><img src={logoUrl} alt="UNICA" /></a><p>Moda con raíz en Medellín.<br />Orgullo para vestir donde estés.</p></div>
          <div className="footer-links"><span className="eyebrow">Descubre</span><a href="#coleccion">Moda colombiana</a><a href="#historia">Nuestra raíz</a><a href="#archivo">Referencias</a></div>
          <div className="footer-links"><span className="eyebrow">Hablemos</span><a href={INSTAGRAM_URL} target="_blank" rel="noreferrer">Instagram <ArrowUpRight size={13} /></a><a href={whatsappUrl('Hola, UNICA. Quisiera conocer más de sus prendas.')} target="_blank" rel="noreferrer">WhatsApp <ArrowUpRight size={13} /></a></div>
          <div className="footer-note"><span>UNICA / MEDELLÍN, COLOMBIA</span><p>La moda de aquí, llevada a tu manera.</p><button className="back-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Volver al inicio"><ArrowLeft size={17} /></button></div>
        </div>
        <div className="footer-bottom page-width"><span>© UNICA · Medellín, Colombia</span><span>Moda de aquí. Orgullo que se viste.</span></div>
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
          key={selectedItem.id}
          item={selectedItem}
          photoIndex={selectedPhoto}
          setPhotoIndex={setSelectedPhoto}
          onClose={() => setSelectedItem(null)}
          onAdd={(variants) => addToCart(selectedItem, variants)}
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
        <span className="product-image-count">{item.photos.length} {item.photos.length === 1 ? 'foto' : 'fotos'}</span>
        <span className="product-image-arrow"><ArrowUpRight size={17} /></span>
      </button>
      <div className="product-info">
        <div className="product-info-top"><span>{item.category}</span><span className="product-price">{formatPrice(item.price)}</span></div>
        <button className="product-name" onClick={() => onOpen(item)}>{name}</button>
        <div className="product-details">{productDetails(item)}</div>
        <button className="product-add" onClick={() => onOpen(item)} aria-label={`${item.price ? 'Elegir opciones de' : 'Consultar'} ${name}`}><span>{item.price ? 'Elegir opciones' : 'Consultar prenda'}</span><ArrowRight size={18} /></button>
      </div>
    </article>
  )
}

function ProductDialog({ item, photoIndex, setPhotoIndex, onClose, onAdd, onAsk }) {
  const sizes = item.details?.filter((detail) => detail.toLowerCase().startsWith('talla ')) || []
  const materials = item.details?.filter((detail) => !detail.toLowerCase().startsWith('talla ')) || []
  const [selectedSize, setSelectedSize] = useState(sizes[0] || '')
  const [selectedColor, setSelectedColor] = useState(item.colors?.[0] || '')
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
        <div className="dialog-copy"><p className="eyebrow">{item.category} · MODA COLOMBIANA <span className="eyebrow-line" /></p><h2>{hasPrice ? productName(item) : item.title}</h2><p className="dialog-description">Una prenda de UNICA, marca nacida en Medellín. Revisa las opciones publicadas y escríbenos para confirmar cualquier detalle antes de pedir.</p>{hasPrice ? <><strong className="dialog-price">{formatPrice(item.price)}</strong><span className="dialog-note">Precio compartido por UNICA · confirma disponibilidad por WhatsApp</span></> : <strong className="dialog-price dialog-consult">Consulta su disponibilidad</strong>}
          {materials.length > 0 && <p className="dialog-attributes"><span>Material</span>{materials.join(' · ')}</p>}
          {sizes.length > 0 && <fieldset className="variant-group"><legend>Talla publicada</legend><div className="variant-options">{sizes.map((size) => <button key={size} type="button" className={`variant-option ${selectedSize === size ? 'active' : ''}`} onClick={() => setSelectedSize(size)}>{size.replace(/^talla\s*/i, '')}</button>)}</div></fieldset>}
          {item.colors?.length > 0 && <fieldset className="variant-group"><legend>Colores publicados</legend><div className="variant-options">{item.colors.map((color) => <button key={color} type="button" className={`variant-option ${selectedColor === color ? 'active' : ''}`} onClick={() => setSelectedColor(color)}>{color}</button>)}</div></fieldset>}
          <div className="dialog-actions">{hasPrice ? <button className="button button-primary" onClick={() => onAdd({ size: selectedSize, color: selectedColor })}>Agregar al carrito <ShoppingBag size={18} /></button> : <button className="button button-primary" onClick={onAsk}>Consultar por WhatsApp <MessageCircle size={18} /></button>}<button className="text-link dialog-instagram" onClick={() => window.open(INSTAGRAM_URL, '_blank', 'noopener,noreferrer')}>Ver en Instagram <ArrowUpRight size={16} /></button></div>
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
          <div className="cart-items">{cart.map((item) => <article className="cart-item" key={item.id}><img src={item.image} alt={item.title} /><div className="cart-item-copy"><span className="eyebrow">UNICA · Selección</span><strong>{item.title}</strong>{item.variant && <span className="cart-item-variant">{item.variant}</span>}<span className="cart-item-price">{formatPrice(item.price)}</span><div className="quantity-control"><button onClick={() => changeQuantity(item.id, -1)} aria-label={`Quitar una unidad de ${item.title}`}><Minus size={13} /></button><span>{item.quantity}</span><button onClick={() => changeQuantity(item.id, 1)} aria-label={`Agregar una unidad de ${item.title}`}><Plus size={13} /></button></div></div><button className="remove-item" onClick={() => changeQuantity(item.id, -item.quantity)} aria-label={`Eliminar ${item.title}`}><Trash2 size={16} /></button></article>)}</div>
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