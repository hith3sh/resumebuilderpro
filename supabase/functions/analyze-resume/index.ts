import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { resumeText } = await req.json()

    if (!resumeText) {
      return new Response(
        JSON.stringify({ error: 'Resume text is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Simple ATS scoring algorithm
    const analysis = analyzeResume(resumeText)

    return new Response(
      JSON.stringify({
        score: analysis.score,
        analysis: analysis.feedback
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Analysis error:', error)

    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

function analyzeResume(resumeText: string) {
  const text = resumeText.toLowerCase()
  let score = 50 // Base score
  const feedback: string[] = []

  // Keywords that boost ATS score
  const goodKeywords = [
    'experience', 'skills', 'education', 'project', 'management', 'leadership',
    'development', 'analysis', 'communication', 'team', 'problem-solving',
    'results', 'achievement', 'improvement', 'strategy', 'implementation'
  ]

  // Formatting indicators
  const hasEmail = /[\w\.-]+@[\w\.-]+\.\w+/.test(text)
  const hasPhone = /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(text)
  const hasBulletPoints = text.includes('•') || text.includes('*') || text.includes('-')

  // Scoring logic
  const keywordMatches = goodKeywords.filter(keyword => text.includes(keyword)).length
  score += Math.min(keywordMatches * 2, 20) // Max 20 points from keywords

  if (hasEmail) {
    score += 10
    feedback.push("✓ Email address found")
  } else {
    feedback.push("✗ Missing email address")
  }

  if (hasPhone) {
    score += 5
    feedback.push("✓ Phone number found")
  } else {
    feedback.push("✗ Consider adding a phone number")
  }

  if (hasBulletPoints) {
    score += 10
    feedback.push("✓ Good use of bullet points for readability")
  } else {
    feedback.push("✗ Consider using bullet points to improve readability")
  }

  // Length check
  const wordCount = text.split(/\s+/).length
  if (wordCount >= 200 && wordCount <= 800) {
    score += 10
    feedback.push("✓ Resume length is appropriate")
  } else if (wordCount < 200) {
    feedback.push("✗ Resume might be too short - consider adding more details")
  } else {
    feedback.push("✗ Resume might be too long - consider condensing")
  }

  // Check for common sections
  const sections = ['experience', 'education', 'skills']
  sections.forEach(section => {
    if (text.includes(section)) {
      score += 3
      feedback.push(`✓ ${section.charAt(0).toUpperCase() + section.slice(1)} section found`)
    }
  })

  // Ensure score is between 0 and 100
  score = Math.min(Math.max(score, 0), 100)

  // Add overall feedback
  if (score >= 75) {
    feedback.unshift("🎉 Excellent! Your resume is well-optimized for ATS systems.")
  } else if (score >= 50) {
    feedback.unshift("👍 Good start! A few improvements will boost your ATS score.")
  } else {
    feedback.unshift("📝 Your resume needs optimization for ATS compatibility.")
  }

  return {
    score: Math.round(score),
    feedback: feedback.join('\n')
  }
}