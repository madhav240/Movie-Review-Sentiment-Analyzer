'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface SentimentData {
  sentiment: 'Positive' | 'Negative' | 'Neutral'
  confidence: number
  explanation: string
  wordCounts: {
    positive: number
    negative: number
    neutral: number
    total: number
  }
  detectedWords: {
    positive: string[]
    negative: string[]
    neutral: string[]
  }
}

interface StoredResult {
  review: string
  result: SentimentData
}

export default function ResultsPage() {
  const [data, setData] = useState<StoredResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const storedData = sessionStorage.getItem('sentimentResult')

    if (!storedData) {
      router.push('/')
      return
    }

    try {
      const parsedData: StoredResult = JSON.parse(storedData)
      setData(parsedData)
    } catch (error) {
      console.error('Error parsing stored data:', error)
      router.push('/')
    } finally {
      setIsLoading(false)
    }
  }, [router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!data) {
    return null
  }

  const { review, result } = data

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'Positive':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'Negative':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    }
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'Positive':
        return '😊'
      case 'Negative':
        return '😞'
      default:
        return '😐'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-3xl font-bold text-gray-900 md:text-5xl">Analysis Results</h1>
          <Link
            className="inline-flex items-center font-medium text-blue-600 hover:text-blue-700"
            href="/"
          >
            ← Analyze Another Review
          </Link>
        </div>

        <div className="mx-auto max-w-4xl space-y-8">
          {/* Original Review */}
          <div className="rounded-2xl bg-white p-8 shadow-xl">
            <h2 className="mb-4 text-2xl font-bold text-gray-800">Original Review</h2>
            <div className="rounded-lg bg-gray-50 p-6">
              <p className="leading-relaxed text-gray-700">{review}</p>
            </div>
          </div>

          {/* Sentiment Result */}
          <div className="rounded-2xl bg-white p-8 shadow-xl">
            <h2 className="mb-6 text-2xl font-bold text-gray-800">Sentiment Analysis</h2>

            <div className={`mb-6 rounded-xl border-2 p-6 ${getSentimentColor(result.sentiment)}`}>
              <div className="mb-4 flex items-center justify-center space-x-4">
                <span className="text-4xl">{getSentimentIcon(result.sentiment)}</span>
                <div className="text-center">
                  <h3 className="text-3xl font-bold">{result.sentiment}</h3>
                  <p className="text-lg">Confidence: {result.confidence.toFixed(1)}%</p>
                </div>
              </div>
              <p className="text-center text-lg">{result.explanation}</p>
            </div>

            {/* Word Counts */}
            <div className="mb-8 grid gap-6 md:grid-cols-3">
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {result.wordCounts.positive}
                </div>
                <div className="text-green-700">Positive Words</div>
              </div>
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{result.wordCounts.negative}</div>
                <div className="text-red-700">Negative Words</div>
              </div>
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {result.wordCounts.neutral}
                </div>
                <div className="text-yellow-700">Neutral Words</div>
              </div>
            </div>

            {/* Detected Words */}
            <div className="space-y-6">
              {result.detectedWords.positive.length > 0 && (
                <div>
                  <h4 className="mb-3 text-lg font-semibold text-green-700">
                    Positive Words Detected:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.detectedWords.positive.map((word, index) => (
                      <span
                        key={index}
                        className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-800"
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {result.detectedWords.negative.length > 0 && (
                <div>
                  <h4 className="mb-3 text-lg font-semibold text-red-700">
                    Negative Words Detected:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.detectedWords.negative.map((word, index) => (
                      <span
                        key={index}
                        className="rounded-full bg-red-100 px-3 py-1 text-sm text-red-800"
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {result.detectedWords.neutral.length > 0 && (
                <div>
                  <h4 className="mb-3 text-lg font-semibold text-yellow-700">
                    Neutral Words Detected:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.detectedWords.neutral.map((word, index) => (
                      <span
                        key={index}
                        className="rounded-full bg-yellow-100 px-3 py-1 text-sm text-yellow-800"
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-x-4 text-center">
            <Link
              className="inline-block transform rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white transition-all duration-200 hover:scale-105 hover:bg-blue-700"
              href="/"
            >
              Analyze Another Review
            </Link>
            <button
              className="inline-block transform rounded-xl bg-gray-600 px-8 py-3 font-semibold text-white transition-all duration-200 hover:scale-105 hover:bg-gray-700"
              onClick={() => {
                const resultText = `
Movie Review: ${review}

Sentiment: ${result.sentiment} (${(result.confidence * 100).toFixed(1)}% confidence)
${result.explanation}

Word Counts:
- Positive: ${result.wordCounts.positive}
- Negative: ${result.wordCounts.negative}
- Neutral: ${result.wordCounts.neutral}
                `.trim()

                navigator.clipboard.writeText(resultText)
                alert('Results copied to clipboard!')
              }}
            >
              Copy Results
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
