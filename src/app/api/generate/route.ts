import Anthropic from '@anthropic-ai/sdk'
import { nanoid } from 'nanoid'
import { NextRequest, NextResponse } from 'next/server'
import { insertArticle } from '@/lib/supabase'

export type ArticleRequest = {
  type: 'travel' | 'reporter' | 'editor'
  layout: 'thermal' | 'tabloid'
  location: string
  date: string
  authorName: string
  content: string
  mediaName?: string
  mediaNameHanja?: string
  issueNumber?: string
}

export type ArticleResponse = {
  id: string
  headline: string
  subtitle: string
  body: string
  byline: string
}

const SYSTEM_PROMPTS: Record<ArticleRequest['type'], string> = {
  travel: `당신은 여행 전문 기자입니다. 여행자의 소감을 감성적이고 생동감 있는
여행 기사로 변환하세요. 장소의 분위기, 느낌, 인상적인 장면을 중심으로
독자가 함께 여행하는 듯한 문체로 작성하세요.`,
  reporter: `당신은 지역 신문 기자입니다. 육하원칙(누가·언제·어디서·무엇을·어떻게·왜)에
따라 사실 중심으로 기사를 작성하세요. 간결하고 명확한 문체로,
가장 중요한 사실을 첫 문장에 담는 역피라미드 구조를 따르세요.`,
  editor: `당신은 신문 편집자입니다. 입력된 내용을 최대한 원문 그대로 살리되,
신문 기사 형식에 맞게 다듬어 주세요. 작성자의 목소리와 의도를
훼손하지 않는 것이 최우선입니다.`,
}

const LANGUAGE_INSTRUCTION = `**최우선 지시 — 언어 일치 (TOP PRIORITY — LANGUAGE MATCHING)**

입력된 언어를 자동으로 감지하여 반드시 같은 언어로 헤드라인·부제목·본문·바이라인을 작성하세요. 한국어로 입력되면 한국어로, 영어면 영어로, 일본어면 일본어로, 스페인어면 스페인어로 작성합니다. 언어 감지가 불명확할 경우 한국어로 작성하세요.

You MUST match the language of the user's input content. If the input is in English, ALL output fields (headline, subtitle, body, byline) MUST be in English. If Japanese, output MUST be in Japanese. Never translate the article to Korean unless the input itself is Korean. The system prompt being in Korean does NOT mean output should be in Korean — only the user's actual input determines output language.`

const JSON_INSTRUCTION = `다음 형식의 JSON으로 응답하세요:
- headline: 20자 내외 헤드라인 (해당 언어 기준 적절한 길이)
- subtitle: 30자 내외 부제목 (해당 언어 기준 적절한 길이)
- body: 400~600자 본문 (인용문은 큰따옴표 대신 한국식 「」 또는 ''(작은따옴표 쌍) 사용. 영어면 single quotes, 일본어면 「」 등 해당 언어 관행 따름)
- byline: "○○○ 특파원 현지 보고" 형식 (해당 언어 관행에 맞게 — 영어 "By ○○○, on-site report" 등)`

const ARTICLE_SCHEMA = {
  type: 'object',
  properties: {
    headline: { type: 'string' },
    subtitle: { type: 'string' },
    body: { type: 'string' },
    byline: { type: 'string' },
  },
  required: ['headline', 'subtitle', 'body', 'byline'],
  additionalProperties: false,
} as const

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(req: NextRequest) {
  let body: ArticleRequest
  try {
    body = (await req.json()) as ArticleRequest
  } catch {
    return NextResponse.json(
      { error: '잘못된 JSON 요청 본문입니다.' },
      { status: 400 },
    )
  }

  const { type, location, date, authorName, content, mediaName } = body

  if (!SYSTEM_PROMPTS[type]) {
    return NextResponse.json(
      { error: `유효하지 않은 type 값입니다: ${type}` },
      { status: 400 },
    )
  }

  const isSixWFormat = type === 'reporter' && /^누가:/m.test(content)
  const sixWInstruction = isSixWFormat
    ? `\n\n육하원칙 형식으로 입력된 내용입니다. 각 항목을 자연스럽게 연결해서 읽기 쉬운 신문 기사로 작성하세요. 입력되지 않은 항목은 문맥에 맞게 자연스럽게 생략하거나 추론해서 채워주세요.`
    : ''

  const systemPrompt = `${LANGUAGE_INSTRUCTION}\n\n${SYSTEM_PROMPTS[type]}${sixWInstruction}\n\n${JSON_INSTRUCTION}`

  const userMessage = `장소: ${location}
날짜: ${date}
작성자: ${authorName}
언론사: ${mediaName ?? '미지정'}
내용: ${content}`

  let response: Anthropic.Message
  try {
    response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      stream: false, // 명시 — Message | Stream 유니온에서 Message로 좁힘
      system: [
        {
          type: 'text',
          text: systemPrompt,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [{ role: 'user', content: userMessage }],
      // 스키마 강제로 JSON 유효성 보장 (Claude Sonnet 4.6+)
      output_config: {
        format: {
          type: 'json_schema',
          schema: ARTICLE_SCHEMA,
        },
      },
    })
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        {
          error: `Claude API 호출 실패: ${error.message}`,
          status: error.status,
        },
        { status: error.status ?? 500 },
      )
    }
    const message = error instanceof Error ? error.message : '알 수 없는 오류'
    return NextResponse.json(
      { error: `Claude API 호출 실패: ${message}` },
      { status: 500 },
    )
  }

  const textBlock = response.content.find((b) => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    return NextResponse.json(
      { error: 'Claude 응답에 텍스트 블록이 없습니다.' },
      { status: 500 },
    )
  }

  // ```json 펜스나 앞뒤 설명 텍스트가 섞여 와도 첫 { ~ 마지막 } 만 추출
  const raw = textBlock.text
  const start = raw.indexOf('{')
  const end = raw.lastIndexOf('}')
  const cleaned = start !== -1 && end > start ? raw.slice(start, end + 1) : raw

  type AIArticle = Omit<ArticleResponse, 'id'>
  let aiArticle: AIArticle
  try {
    aiArticle = JSON.parse(cleaned) as AIArticle
  } catch {
    return NextResponse.json(
      {
        error: 'Claude 응답을 JSON으로 파싱하지 못했습니다.',
        raw: textBlock.text,
      },
      { status: 500 },
    )
  }

  // Supabase에 저장 → QR 공유 가능한 short id 발급
  const id = nanoid(8)
  try {
    await insertArticle({
      id,
      type: body.type,
      layout: body.layout,
      headline: aiArticle.headline,
      subtitle: aiArticle.subtitle,
      body: aiArticle.body,
      byline: aiArticle.byline,
      date: body.date,
      location: body.location,
      authorName: body.authorName,
      mediaName: body.mediaName ?? '다산어보',
      mediaNameHanja: body.mediaNameHanja,
      issueNumber: body.issueNumber,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : '알 수 없는 오류'
    return NextResponse.json(
      { error: `기사는 생성됐지만 저장에 실패했습니다: ${msg}` },
      { status: 500 },
    )
  }

  return NextResponse.json({ id, ...aiArticle } satisfies ArticleResponse)
}
