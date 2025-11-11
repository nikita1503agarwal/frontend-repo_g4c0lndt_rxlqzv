import { useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import Spline from '@splinetool/react-spline'
import { Search, Menu, Phone, Info, Package, Home, Filter as FilterIcon, SortAsc, SortDesc } from 'lucide-react'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || ''

function useQuery() {
  const { search } = useLocation()
  return useMemo(() => new URLSearchParams(search), [search])
}

function Layout({ children }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-slate-800">
      <header className="sticky top-0 z-20 backdrop-blur bg-white/70 border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <Package className="w-6 h-6 text-blue-600" />
            <span>[Nama Bisnis Anda]</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="hover:text-blue-600 flex items-center gap-2"><Home className="w-4 h-4"/>Beranda</Link>
            <Link to="/katalog" className="hover:text-blue-600 flex items-center gap-2"><Package className="w-4 h-4"/>Katalog</Link>
            <Link to="/tentang" className="hover:text-blue-600 flex items-center gap-2"><Info className="w-4 h-4"/>Tentang</Link>
            <Link to="/kontak" className="hover:text-blue-600 flex items-center gap-2"><Phone className="w-4 h-4"/>Kontak</Link>
          </nav>
          <button className="md:hidden" onClick={()=>setOpen(v=>!v)}><Menu/></button>
        </div>
        {open && (
          <div className="md:hidden border-t bg-white">
            <div className="px-4 py-2 flex flex-col">
              <Link to="/" className="py-2" onClick={()=>setOpen(false)}>Beranda</Link>
              <Link to="/katalog" className="py-2" onClick={()=>setOpen(false)}>Katalog</Link>
              <Link to="/tentang" className="py-2" onClick={()=>setOpen(false)}>Tentang</Link>
              <Link to="/kontak" className="py-2" onClick={()=>setOpen(false)}>Kontak</Link>
            </div>
          </div>
        )}
      </header>
      {children}
      <footer className="border-t mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8 text-sm text-slate-600">© {new Date().getFullYear()} [Nama Bisnis Anda]. All rights reserved.</div>
      </footer>
    </div>
  )
}

function HomePage() {
  const [featured, setFeatured] = useState([])
  useEffect(()=>{
    fetch(`${BACKEND_URL}/api/products/featured`).then(r=>r.json()).then(setFeatured).catch(()=>{})
  },[])

  return (
    <main>
      <section className="relative h-[520px] overflow-hidden">
        <Spline scene="https://prod.spline.design/VJLoxp84lCdVfdZu/scene.splinecode" style={{ width:'100%', height:'100%' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/60 to-transparent pointer-events-none" />
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-3">Temukan Produk Terbaik Kami</h1>
          <p className="text-slate-600 mb-6">Kualitas unggul, harga bersaing, dan layanan ramah untuk kebutuhan Anda.</p>
          <div className="flex justify-center">
            <Link to="/katalog" className="bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow hover:bg-blue-700">Lihat Katalog</Link>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-semibold mb-6">Produk Unggulan</h2>
        <ProductGrid items={featured} emptyText="Belum ada produk unggulan."/>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-semibold mb-6">Kategori Utama</h2>
        <CategoryRow/>
      </section>
    </main>
  )
}

function CategoryRow(){
  const [cats, setCats] = useState([])
  useEffect(()=>{ fetch(`${BACKEND_URL}/api/categories`).then(r=>r.json()).then(setCats).catch(()=>{}) },[])
  if(!cats.length) return <p className="text-slate-500">Belum ada kategori.</p>
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cats.map(c=> (
        <Link to={`/katalog?category=${encodeURIComponent(c.slug)}`} key={c.id} className="group bg-white rounded-xl p-5 border hover:shadow transition">
          <div className="text-lg font-semibold group-hover:text-blue-600">{c.name}</div>
          <div className="text-slate-500 text-sm mt-1 line-clamp-2">{c.description}</div>
        </Link>
      ))}
    </div>
  )
}

function ProductGrid({ items, emptyText }){
  if(!items || !items.length) return <div className="text-slate-500">{emptyText}</div>
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map(p=> (
        <Link key={p.id} to={`/produk/${p.id}`} className="bg-white border rounded-xl overflow-hidden hover:shadow">
          <div className="aspect-square bg-slate-100">
            {p.images?.[0] ? (
              <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover"/>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">No Image</div>
            )}
          </div>
          <div className="p-3">
            <div className="font-semibold line-clamp-1">{p.name}</div>
            <div className="text-blue-600 font-bold">{formatIDR(p.price)}</div>
          </div>
        </Link>
      ))}
    </div>
  )
}

function KatalogPage(){
  const q = useQuery()
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [cats, setCats] = useState([])
  const navigate = useNavigate()

  const params = {
    search: q.get('search') || '',
    category: q.get('category') || '',
    minPrice: q.get('minPrice') || '',
    maxPrice: q.get('maxPrice') || '',
    sort: q.get('sort') || '',
    page: Number(q.get('page') || 1)
  }

  useEffect(()=>{ fetch(`${BACKEND_URL}/api/categories`).then(r=>r.json()).then(setCats).catch(()=>{}) },[])

  useEffect(()=>{
    setLoading(true)
    const query = new URLSearchParams()
    Object.entries(params).forEach(([k,v])=>{ if(v) query.set(k, v) })
    fetch(`${BACKEND_URL}/api/products?${query.toString()}`)
      .then(r=>r.json())
      .then(d=>{ setItems(d.items||[]); setTotal(d.total||0) })
      .finally(()=>setLoading(false))
  },[params.search, params.category, params.minPrice, params.maxPrice, params.sort, params.page])

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-4">Katalog Produk</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 bg-white border rounded-xl p-4 h-fit sticky top-24">
          <div className="flex items-center gap-2 mb-3 font-medium"><FilterIcon className="w-4 h-4"/>Filter</div>
          <label className="text-sm text-slate-600">Cari</label>
          <div className="relative mb-4">
            <input defaultValue={params.search} onKeyDown={(e)=>{ if(e.key==='Enter') updateParam(navigate, 'search', e.currentTarget.value) }} className="w-full border rounded-lg px-3 py-2 pr-9" placeholder="Cari produk..."/>
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"/>
          </div>
          <div className="mb-3">
            <label className="text-sm text-slate-600">Kategori</label>
            <select value={params.category} onChange={(e)=>updateParam(navigate,'category',e.target.value)} className="w-full border rounded-lg px-3 py-2 mt-1">
              <option value="">Semua</option>
              {cats.map(c=> <option key={c.id} value={c.slug}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-sm text-slate-600">Harga Min</label>
              <input type="number" defaultValue={params.minPrice} onBlur={(e)=>updateParam(navigate,'minPrice',e.target.value)} className="w-full border rounded-lg px-3 py-2 mt-1"/>
            </div>
            <div>
              <label className="text-sm text-slate-600">Harga Max</label>
              <input type="number" defaultValue={params.maxPrice} onBlur={(e)=>updateParam(navigate,'maxPrice',e.target.value)} className="w-full border rounded-lg px-3 py-2 mt-1"/>
            </div>
          </div>
          <div className="mb-2">
            <label className="text-sm text-slate-600">Urutkan</label>
            <select value={params.sort} onChange={(e)=>updateParam(navigate,'sort',e.target.value)} className="w-full border rounded-lg px-3 py-2 mt-1">
              <option value="">Default</option>
              <option value="price_asc">Harga Terendah</option>
              <option value="price_desc">Harga Tertinggi</option>
              <option value="name_asc">Nama (A-Z)</option>
            </select>
          </div>
        </div>
        <div className="md:col-span-3">
          {loading ? <div className="text-slate-500">Memuat...</div> : <ProductGrid items={items} emptyText="Produk tidak ditemukan."/>}
        </div>
      </div>
    </main>
  )
}

function ProductDetail(){
  const { pathname } = useLocation()
  const id = pathname.split('/').pop()
  const [data, setData] = useState(null)
  useEffect(()=>{ fetch(`${BACKEND_URL}/api/products/${id}`).then(r=>r.json()).then(setData) },[id])
  if(!data) return <main className="max-w-5xl mx-auto px-4 py-10">Memuat...</main>
  const waText = encodeURIComponent(`Halo, saya tertarik dengan produk: ${data.name} (${formatIDR(data.price)})`)
  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="aspect-square bg-white border rounded-xl overflow-hidden">
            {data.images?.[0] ? <img src={data.images[0]} alt={data.name} className="w-full h-full object-contain"/> : <div className="w-full h-full flex items-center justify-center text-slate-400">No Image</div>}
          </div>
          {data.images?.length>1 && (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {data.images.slice(0,5).map((img,idx)=> (
                <img key={idx} src={img} className="aspect-square object-cover rounded border"/>
              ))}
            </div>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-semibold">{data.name}</h1>
          <div className="text-blue-600 text-xl font-bold mt-1">{formatIDR(data.price)}</div>
          {data.stock !== undefined && <div className="mt-1 text-sm text-slate-600">Stok: {data.stock}</div>}
          <p className="mt-4 text-slate-700 whitespace-pre-line">{data.description}</p>
          <div className="mt-6 flex gap-3">
            <a className="bg-green-600 text-white px-4 py-2 rounded-lg" href={`https://wa.me/` + (import.meta.env.VITE_WA_NUMBER||'') + `?text=${waText}`} target="_blank">Hubungi via WhatsApp</a>
            <a className="bg-blue-600 text-white px-4 py-2 rounded-lg" href={`mailto:` + (import.meta.env.VITE_CONTACT_EMAIL||'')} target="_blank">Pesan Sekarang</a>
          </div>
        </div>
      </div>
    </main>
  )
}

function AboutPage(){
  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-semibold mb-3">Tentang Kami</h1>
      <p className="text-slate-700">[Nama Bisnis Anda] adalah penyedia produk berkualitas dengan layanan ramah. Kami berkomitmen menghadirkan pengalaman belanja yang mudah dan menyenangkan.</p>
    </main>
  )
}

function ContactPage(){
  const [status, setStatus] = useState('')
  const onSubmit = async (e) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const payload = { name: form.get('name'), email: form.get('email'), message: form.get('message') }
    const res = await fetch(`${BACKEND_URL}/api/contact`, { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(payload) })
    if(res.ok){ setStatus('Terkirim! Kami akan segera menghubungi Anda.') } else { setStatus('Gagal mengirim. Coba lagi.') }
  }
  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-semibold mb-3">Kontak</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="mb-2">Alamat: <span className="text-slate-700">[Alamat Bisnis]</span></div>
          <div className="mb-2">Telepon: <span className="text-slate-700">[Nomor Telepon]</span></div>
          <div className="mb-2">Email: <span className="text-slate-700">{import.meta.env.VITE_CONTACT_EMAIL || 'email@domain.com'}</span></div>
        </div>
        <form className="bg-white border rounded-xl p-5" onSubmit={onSubmit}>
          <div className="grid gap-3">
            <input name="name" placeholder="Nama" className="border rounded-lg px-3 py-2" required/>
            <input type="email" name="email" placeholder="Email" className="border rounded-lg px-3 py-2" required/>
            <textarea name="message" placeholder="Pesan" rows="4" className="border rounded-lg px-3 py-2" required/>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">Kirim</button>
            {status && <div className="text-sm text-green-600">{status}</div>}
          </div>
        </form>
      </div>
    </main>
  )
}

function formatIDR(n){
  try { return new Intl.NumberFormat('id-ID', { style:'currency', currency:'IDR', maximumFractionDigits:0 }).format(n) } catch { return `Rp ${n}` }
}

function updateParam(navigate, key, value){
  const url = new URL(window.location.href)
  if(value && value !== '') url.searchParams.set(key, value); else url.searchParams.delete(key)
  url.searchParams.set('page','1')
  navigate(url.pathname + '?' + url.searchParams.toString())
}

function AppRouter(){
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage/>} />
          <Route path="/katalog" element={<KatalogPage/>} />
          <Route path="/produk/:id" element={<ProductDetail/>} />
          <Route path="/tentang" element={<AboutPage/>} />
          <Route path="/kontak" element={<ContactPage/>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default AppRouter
