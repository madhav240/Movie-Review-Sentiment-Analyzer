import { NextRequest, NextResponse } from 'next/server'

// Predefined word lists for sentiment analysis
const positiveWords = [
  'amazing',
  'awesome',
  'brilliant',
  'excellent',
  'fantastic',
  'great',
  'good',
  'wonderful',
  'outstanding',
  'perfect',
  'superb',
  'magnificent',
  'incredible',
  'marvelous',
  'spectacular',
  'phenomenal',
  'exceptional',
  'remarkable',
  'beautiful',
  'lovely',
  'charming',
  'delightful',
  'enjoyable',
  'entertaining',
  'hilarious',
  'funny',
  'touching',
  'moving',
  'inspiring',
  'uplifting',
  'thrilling',
  'exciting',
  'captivating',
  'engaging',
  'compelling',
  'cool',
  'stylish',
]

const negativeWords = [
  'awful',
  'terrible',
  'horrible',
  'bad',
  'poor',
  'disappointing',
  'boring',
  'dull',
  'stupid',
  'ridiculous',
  'pathetic',
  'waste',
  'worst',
  'hate',
  'disgusting',
  'annoying',
  'frustrating',
  'confusing',
  'pointless',
  'meaningless',
  'shallow',
  'predictable',
  'cliche',
  'overrated',
  'underwhelming',
  'mediocre',
  'forgettable',
  'uninspiring',
  'tedious',
  'painful',
  'cringe',
  'awkward',
  'mess',
  'disaster',
  'failure',
]

const neutralWords = [
  'okay',
  'fine',
  'average',
  'decent',
  'alright',
  'normal',
  'standard',
  'typical',
  'ordinary',
  'regular',
  'moderate',
  'fair',
  'acceptable',
]

interface SentimentResult {
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

function analyzeSentiment(text: string): SentimentResult {
  // Clean and normalize the text
  const cleanText = text.toLowerCase().replace(/[^\w\s]/g, ' ')
  const words = cleanText.split(/\s+/).filter((word) => word.length > 2)

  // Handle negations
  const negationWords = ['not', 'no', 'never', 'nothing', 'nobody', 'nowhere', 'neither', 'nor']
  let isNegated = false

  let positiveCount = 0
  let negativeCount = 0
  let neutralCount = 0

  const detectedPositive: string[] = []
  const detectedNegative: string[] = []
  const detectedNeutral: string[] = []

  for (let i = 0; i < words.length; i++) {
    const word = words[i]

    // Check for negation in the previous 2 words
    isNegated = false
    for (let j = Math.max(0, i - 2); j < i; j++) {
      if (negationWords.includes(words[j])) {
        isNegated = true
        break
      }
    }

    if (positiveWords.includes(word)) {
      if (isNegated) {
        negativeCount++
        detectedNegative.push(`not ${word}`)
      } else {
        positiveCount++
        detectedPositive.push(word)
      }
    } else if (negativeWords.includes(word)) {
      if (isNegated) {
        positiveCount++
        detectedPositive.push(`not ${word}`)
      } else {
        negativeCount++
        detectedNegative.push(word)
      }
    } else if (neutralWords.includes(word)) {
      neutralCount++
      detectedNeutral.push(word)
    }
  }

  // Determine sentiment with neutral preference
  let sentiment: 'Positive' | 'Negative' | 'Neutral'
  let explanation: string
  let confidence: number

  const totalSentimentWords = positiveCount + negativeCount + neutralCount

  if (totalSentimentWords === 0) {
    sentiment = 'Neutral'
    explanation = 'No clear sentiment indicators found in the review.'
    confidence = 0
  } else {
    // Find the majority word type with neutral preference
    const maxCount = Math.max(positiveCount, negativeCount, neutralCount)

    // If positive and negative are equal, confidence is 100%
    if (positiveCount === negativeCount && positiveCount > 0 && negativeCount > 0) {
      sentiment = 'Neutral'
      confidence = 100
      explanation = `The review contains an equal number of positive (${positiveCount}) and negative (${negativeCount}) words, resulting in a neutral sentiment with maximum confidence.`
    }

    // If neutral has any presence and ties with others, neutral wins
    else if (
      neutralCount > 0 &&
      (neutralCount === maxCount ||
        (neutralCount === positiveCount && positiveCount > negativeCount) ||
        (neutralCount === negativeCount && negativeCount > positiveCount) ||
        (neutralCount === positiveCount && neutralCount === negativeCount))
    ) {
      sentiment = 'Neutral'
      confidence = (neutralCount / totalSentimentWords) * 100
      explanation = `The review contains ${neutralCount} neutral words, ${positiveCount} positive words, and ${negativeCount} negative words. Neutral sentiment takes precedence.`
    }

    // Otherwise, determine by majority
    else if (positiveCount > negativeCount && positiveCount > neutralCount) {
      sentiment = 'Positive'
      confidence = (positiveCount / totalSentimentWords) * 100
      explanation = `The review contains ${positiveCount} positive words, ${negativeCount} negative words, and ${neutralCount} neutral words, indicating an overall positive sentiment.`
    } else if (negativeCount > positiveCount && negativeCount > neutralCount) {
      sentiment = 'Negative'
      confidence = (negativeCount / totalSentimentWords) * 100
      explanation = `The review contains ${negativeCount} negative words, ${positiveCount} positive words, and ${neutralCount} neutral words, indicating an overall negative sentiment.`
    } else {
      // Fallback to neutral if no clear majority
      sentiment = 'Neutral'
      confidence =
        (Math.max(positiveCount, negativeCount, neutralCount) / totalSentimentWords) * 100
      explanation = `No clear sentiment majority found. The review contains ${positiveCount} positive, ${negativeCount} negative, and ${neutralCount} neutral words.`
    }
  }

  // Round confidence to 1 decimal place
  confidence = Math.round(confidence * 10) / 10

  return {
    sentiment,
    confidence,
    explanation,
    wordCounts: {
      positive: positiveCount,
      negative: negativeCount,
      neutral: neutralCount,
      total: words.length,
    },
    detectedWords: {
      positive: detectedPositive,
      negative: detectedNegative,
      neutral: detectedNeutral,
    },
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { review } = body

    if (!review || typeof review !== 'string') {
      return NextResponse.json(
        { error: 'Review text is required and must be a string' },
        { status: 400 }
      )
    }

    if (review.trim().length < 10) {
      return NextResponse.json(
        { error: 'Review must be at least 10 characters long' },
        { status: 400 }
      )
    }

    const result = analyzeSentiment(review)

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('Error analyzing sentiment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
