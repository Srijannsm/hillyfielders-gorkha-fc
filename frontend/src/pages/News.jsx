import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { getNews, getArticle } from '../services/api'

function ArticleCard({ article }) {
  return (
    <Link to={`/news/${article.slug}`} className="group">
      <div className="bg-white rounded-xl overflow-hidden shadow hover:shadow-lg transition-shadow h-full flex flex-col">
        <div className="bg-[#1B4332] h-48 overflow-hidden flex-shrink-0">
          {article.cover_image ? (
            <img
              src={article.cover_image}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-[#BEFF00] text-4xl font-black">GFC</span>
            </div>
          )}
        </div>
        <div className="p-5 flex flex-col flex-1">
          <p className="text-[#1B4332] text-xs font-semibold uppercase tracking-wider mb-2">
            {article.category_name}
          </p>
          <h3 className="font-bold text-gray-800 text-lg leading-snug group-hover:text-[#1B4332] transition-colors flex-1">
            {article.title}
          </h3>
          <p className="text-gray-400 text-xs mt-3">
            {new Date(article.created_at).toLocaleDateString('en-GB', {
              day: 'numeric', month: 'long', year: 'numeric'
            })}
          </p>
        </div>
      </div>
    </Link>
  )
}

export function NewsList() {
  const { data: articles, isLoading, isError } = useQuery({
    queryKey: ['news'],
    queryFn: getNews,
  })

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-[#1B4332] font-bold animate-pulse">Loading news...</p>
    </div>
  )

  if (isError) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-red-500">Failed to load news.</p>
    </div>
  )

  return (
    <div>
      <section className="bg-[#1B4332] text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-[#BEFF00] text-sm font-semibold uppercase tracking-widest mb-2">
            Hillyfielders Gorkha FC
          </p>
          <h1 className="text-5xl font-black">Latest News</h1>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {!articles?.length ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-4">📰</p>
            <p className="font-semibold">No articles published yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map(a => <ArticleCard key={a.id} article={a} />)}
          </div>
        )}
      </div>
    </div>
  )
}

export function ArticleDetail() {
  const { slug } = useParams()

  const { data: article, isLoading, isError } = useQuery({
    queryKey: ['article', slug],
    queryFn: () => getArticle(slug),
  })

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-[#1B4332] font-bold animate-pulse">Loading article...</p>
    </div>
  )

  if (isError) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-red-500">Article not found.</p>
    </div>
  )

  return (
    <div>
      {/* Hero image */}
      {article.cover_image && (
        <div className="w-full h-72 md:h-96 overflow-hidden">
          <img
            src={article.cover_image}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link
          to="/news"
          className="text-[#1B4332] text-sm font-semibold hover:underline mb-6 inline-block"
        >
          ← Back to News
        </Link>

        <p className="text-[#1B4332] text-xs font-semibold uppercase tracking-wider mb-3">
          {article.category_name}
        </p>

        <h1 className="text-4xl font-black text-gray-800 leading-tight mb-4">
          {article.title}
        </h1>

        <p className="text-gray-400 text-sm mb-8">
          {article.author_name && `By ${article.author_name} · `}
          {new Date(article.created_at).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'long', year: 'numeric'
          })}
        </p>

        <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
          {article.content}
        </div>
      </div>
    </div>
  )
}