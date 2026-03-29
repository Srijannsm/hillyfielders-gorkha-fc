import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { getNews, getArticle } from '../services/api'

/* ── Article card (dark image overlay) ────────────────── */
function ArticleCard({ article, featured = false }) {
  return (
    <Link to={`/news/${article.slug}`} className="group block h-full">
      <div className={`relative overflow-hidden bg-gfc-800 h-full ${featured ? 'min-h-[420px]' : 'min-h-[260px]'}`}>
        {article.cover_image ? (
          <img
            src={article.cover_image}
            alt={article.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-600 opacity-70"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gfc-800">
            <span className="text-gfc-lime/[0.06] font-black select-none" style={{ fontSize: '120px', lineHeight: 1 }}>GFC</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <p className="text-gfc-lime text-[10px] font-black uppercase tracking-widest mb-2">
            {article.category_name || 'Club News'}
          </p>
          <h3 className={`text-white font-black uppercase leading-tight group-hover:text-gfc-lime transition-colors ${featured ? 'text-xl md:text-2xl' : 'text-sm'}`}>
            {article.title}
          </h3>
          <p className="text-gray-500 text-xs mt-2 flex items-center gap-2">
            <span className="w-3 h-px bg-gfc-lime inline-block flex-shrink-0" />
            {new Date(article.created_at).toLocaleDateString('en-GB', {
              day: 'numeric', month: 'long', year: 'numeric',
            })}
          </p>
        </div>
      </div>
    </Link>
  )
}

/* ── News list page ────────────────────────────────────── */
export function NewsList() {
  const { data: articles, isLoading, isError } = useQuery({
    queryKey: ['news'],
    queryFn: getNews,
  })

  if (isLoading) return (
    <div className="min-h-screen bg-gfc-900 flex items-center justify-center">
      <div className="text-center">
        <div className="text-gfc-lime font-black text-3xl animate-pulse mb-2">GFC</div>
        <p className="text-gray-600 text-[10px] uppercase tracking-widest">Loading...</p>
      </div>
    </div>
  )

  if (isError) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-red-500 text-sm">Failed to load news.</p>
    </div>
  )

  return (
    <div>
      {/* Header (dark) */}
      <section className="section-bg bg-gfc-900 text-white pt-20 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="eyebrow mb-5">Hillyfielders Gorkha FC</p>
          <h1 className="font-black uppercase leading-none" style={{ fontSize: 'clamp(48px, 8vw, 88px)' }}>
            Latest News
          </h1>
        </div>
      </section>

      {/* Article grid (white) */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          {!articles?.length ? (
            <div className="text-center py-24 border border-gray-100 bg-gray-50">
              <p className="text-gfc-700/20 font-black text-5xl mb-4" style={{ fontFamily: 'Oswald, sans-serif' }}>GFC</p>
              <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">No Articles Yet</p>
              <p className="text-gray-300 text-sm mt-1">Check back soon for club updates.</p>
            </div>
          ) : articles.length >= 3 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="md:col-span-2"><ArticleCard article={articles[0]} featured /></div>
                <div className="flex flex-col gap-4">
                  {articles.slice(1, 3).map(a => (
                    <div key={a.id} className="flex-1"><ArticleCard article={a} /></div>
                  ))}
                </div>
              </div>
              {articles.length > 3 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {articles.slice(3).map(a => <ArticleCard key={a.id} article={a} />)}
                </div>
              )}
            </>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {articles.map(a => <ArticleCard key={a.id} article={a} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Article detail page ───────────────────────────────── */
export function ArticleDetail() {
  const { slug } = useParams()

  const { data: article, isLoading, isError } = useQuery({
    queryKey: ['article', slug],
    queryFn: () => getArticle(slug),
  })

  if (isLoading) return (
    <div className="min-h-screen bg-gfc-900 flex items-center justify-center">
      <div className="text-center">
        <div className="text-gfc-lime font-black text-3xl animate-pulse mb-2">GFC</div>
        <p className="text-gray-600 text-[10px] uppercase tracking-widest">Loading...</p>
      </div>
    </div>
  )

  if (isError) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-red-500 text-sm">Article not found.</p>
    </div>
  )

  return (
    <div>
      {/* Hero image */}
      {article.cover_image ? (
        <div className="w-full h-64 md:h-[480px] overflow-hidden relative bg-gfc-900">
          <img src={article.cover_image} alt={article.title} className="w-full h-full object-cover opacity-75" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      ) : (
        <div className="section-bg bg-gfc-900 h-40" />
      )}

      {/* Article body (white) */}
      <div className="bg-white">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <Link
            to="/news"
            className="inline-flex items-center gap-2 text-gfc-700 text-[10px] font-black uppercase tracking-widest hover:text-gfc-500 transition-colors mb-10"
          >
            ← Back to News
          </Link>

          <p className="text-gfc-700 text-[10px] font-black uppercase tracking-widest mb-4">
            {article.category_name || 'Club News'}
          </p>

          <h1 className="font-black uppercase text-gray-900 leading-tight mb-6" style={{ fontSize: 'clamp(28px, 4vw, 52px)' }}>
            {article.title}
          </h1>

          <div className="flex items-center gap-4 mb-10 pb-8 border-b border-gray-100">
            <span className="w-6 h-0.5 bg-gfc-700" />
            <p className="text-gray-400 text-xs uppercase tracking-widest">
              {article.author_name && <span className="text-gray-600 font-semibold mr-2">{article.author_name}</span>}
              {new Date(article.created_at).toLocaleDateString('en-GB', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </p>
          </div>

          <div className="text-gray-600 leading-relaxed text-base whitespace-pre-line">
            {article.content}
          </div>
        </div>
      </div>
    </div>
  )
}
