'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function HomePage() {
  const [review, setReview] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (review.trim().length < 10) {
      setError('Please enter a review with at least 10 characters.')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ review: review.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze sentiment')
      }

      // Store the result in sessionStorage and navigate to results
      sessionStorage.setItem(
        'sentimentResult',
        JSON.stringify({
          review: review.trim(),
          result: data.data,
        })
      )

      router.push('/results')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-6xl">
            🎬 Movie Review
            <span className="text-blue-600"> Sentiment Analyzer</span>
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-gray-600">
            Discover the emotional tone of movie reviews using advanced sentiment analysis. Simply
            paste a review and get instant insights!
          </p>
        </div>

        {/* Main Form */}
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl bg-white p-8 shadow-xl md:p-12">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="mb-3 block text-lg font-semibold text-gray-700" htmlFor="review">
                  Enter Movie Review
                </label>
                <textarea
                  className="h-48 w-full resize-none rounded-xl border-2 border-gray-200 px-4 py-3 text-gray-700 placeholder-gray-400 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  disabled={isLoading}
                  id="review"
                  placeholder="Type or paste a movie review here... (e.g., 'This movie was absolutely amazing! The acting was superb and the plot was engaging throughout.')"
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                />
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm text-gray-500">Minimum 10 characters required</span>
                  <span className="text-sm text-gray-500">{review.length} characters</span>
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <button
                className="w-full transform rounded-xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-gray-400"
                disabled={isLoading || review.trim().length < 10}
                type="submit"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                    <span>Analyzing Sentiment...</span>
                  </div>
                ) : (
                  'Analyze Sentiment'
                )}
              </button>
            </form>
          </div>

          {/* Features Section */}
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            <div className="rounded-xl bg-white p-6 text-center shadow-lg">
              <div className="mb-4 text-3xl">🎯</div>
              <h3 className="mb-2 text-xl font-semibold text-gray-800">Accurate Analysis</h3>
              <p className="text-gray-600">
                Advanced rule-based sentiment detection with negation handling
              </p>
            </div>
            <div className="rounded-xl bg-white p-6 text-center shadow-lg">
              <div className="mb-4 text-3xl">⚡</div>
              <h3 className="mb-2 text-xl font-semibold text-gray-800">Instant Results</h3>
              <p className="text-gray-600">Get sentiment analysis results in milliseconds</p>
            </div>
            <div className="rounded-xl bg-white p-6 text-center shadow-lg">
              <div className="mb-4 text-3xl">📊</div>
              <h3 className="mb-2 text-xl font-semibold text-gray-800">Detailed Insights</h3>
              <p className="text-gray-600">
                Comprehensive breakdown of positive, negative, and neutral words
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
