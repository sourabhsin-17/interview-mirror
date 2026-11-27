import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const MODEL_NAME = 'gemini-4-hydrogen';

const CRITERION_ORDER = [
  'Relevance',
  'Clarity & Structure',
  'Reasoning',
  'Use of Specific Examples',
] as const;

type CriterionKey = (typeof CRITERION_ORDER)[number];

interface RubricInput {
  key: CriterionKey;
  summary: string;
  level1: string;
  level3: string;
  level5: string;
}

interface EvaluateBody {
  roleTitle: string;
  question: {
    category: string;
    prompt: string;
  };
  rubric: RubricInput[];
  answer: string;
  previousAnswer?: string;
  previousScores?: Array<{ criterion: string; score: number }>;
}

function getGenAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('MISSING_API_KEY');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function recoverExactSubstring(answer: string, rawQuote: string): string | null {
  const quote = rawQuote.trim();
  if (!quote || quote.length < 3) return null;
  if (answer.includes(quote)) return quote;

  const lowerAnswer = answer.toLowerCase();
  const lowerQuote = quote.toLowerCase();
  const idx = lowerAnswer.indexOf(lowerQuote);
  if (idx !== -1) {
    return answer.slice(idx, idx + quote.length);
  }
  return null;
}

function mapApiError(err: unknown): { status: number; message: string } {
  const msg = err instanceof Error ? err.message : String(err);
  console.error('[InterviewMirror API error]', msg);
  if (msg === 'MISSING_API_KEY') {
    return {
      status: 500,
      message: 'Gemini API key is not configured. Please verify your Settings > Secrets configuration.',
    };
  }
  if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
    return {
      status: 429,
      message: 'Rate limit reached while contacting the evaluator. Please wait a few seconds and retry.',
    };
  }
  if (msg.includes('403') || msg.includes('PERMISSION_DENIED') || msg.includes('API_KEY_INVALID')) {
    return {
      status: 403,
      message: 'API access was denied. Please verify your Gemini API key in Settings > Secrets.',
    };
  }
  return {
    status: 500,
    message: 'Unable to complete the evaluation right now. Please try again.',
  };
}

const app = express();
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.post('/api/evaluate', async (req: Request, res: Response) => {
  try {
    const body = req.body as Partial<EvaluateBody>;
    const roleTitle = typeof body.roleTitle === 'string' ? body.roleTitle.trim() : '';
    const answer = typeof body.answer === 'string' ? body.answer.trim() : '';
    const questionPrompt = typeof body.question?.prompt === 'string' ? body.question.prompt.trim() : '';
    const questionCategory = typeof body.question?.category === 'string' ? body.question.category.trim() : 'General';
    const rubric = Array.isArray(body.rubric) ? body.rubric : [];

    if (!roleTitle || !questionPrompt || rubric.length !== 4) {
      res.status(400).json({ error: 'Invalid evaluation payload: role, question, and 4 rubric criteria are required.' });
      return;
    }

    if (!answer) {
      res.status(400).json({ error: 'Please write an answer before submitting for evaluation.' });
      return;
    }

    if (answer.length > 8000) {
      res.status(400).json({ error: 'Answer is too long (maximum 8,000 characters). Please tighten your response.' });
      return;
    }

    const isRevision = typeof body.previousAnswer === 'string' && body.previousAnswer.trim().length > 0;
    const rubricText = rubric
      .map(
        (r) =>
          `- ${r.key} (${r.summary})\n  1: ${r.level1}\n  3: ${r.level3}\n  5: ${r.level5}`
      )
      .join('\n');

    const revisionContext = isRevision
      ? `\n\nPRIOR ATTEMPT FOR COMPARISON:\nPrevious Answer:\n"""\n${body.previousAnswer}\n"""\nPrevious Scores: ${JSON.stringify(
          body.previousScores ?? []
        )}\nAlso provide "improvement_note" (1-2 factual sentences explaining what specifically improved or changed between the previous answer and this revised answer).`
      : '';

    const systemInstruction = `You are InterviewMirror, a calm, objective interview coach evaluating ONLY the written text of a candidate's practice answer.

STRICT EVALUATION RULES:
1. Evaluate ONLY against these exact 4 rubric criteria: "Relevance", "Clarity & Structure", "Reasoning", "Use of Specific Examples". Never invent or reference any other criterion.
2. Score each criterion strictly as an integer 1, 2, 3, 4, or 5 anchored to the visible rubric descriptions.
3. Every entry in "evidence" MUST set "quote" to an EXACT verbatim substring copied character-for-character from the candidate's answer (same casing and punctuation, no ellipses, no paraphrasing).
4. If the answer is very short (e.g. under 15 words) or off-topic, say so plainly in "overall_summary" and the criterion justifications rather than inventing evidence or stretching quotes. Only return quotes that actually exist in the answer.
5. Evaluate ONLY the text provided. Never infer personality, honesty, confidence, appearance, accent, name, or job suitability. Never guarantee employment outcomes.
6. Provide exactly 3 concrete, actionable steps in "top_3_fixes" and an "improved_example" answer demonstrating how to apply those fixes for this role and question.`;

    const prompt = `Target Role: ${roleTitle}
Question Type: ${questionCategory}
Interview Question: ${questionPrompt}

Visible Rubric (1-5 scale):
${rubricText}

Candidate's Answer:
"""
${answer}
"""${revisionContext}`;

    const ai = getGenAIClient();
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction,
        seed: 42,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scores: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  criterion: {
                    type: Type.STRING,
                    description: 'Must be exactly one of: Relevance, Clarity & Structure, Reasoning, Use of Specific Examples',
                  },
                  score: {
                    type: Type.INTEGER,
                    description: 'Integer score from 1 to 5.',
                  },
                  justification: {
                    type: Type.STRING,
                    description: 'Exactly one concise sentence justifying the score based on the answer text.',
                  },
                },
                required: ['criterion', 'score', 'justification'],
              },
            },
            evidence: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  quote: {
                    type: Type.STRING,
                    description: 'Exact verbatim substring copied directly from the candidate answer.',
                  },
                  criterion: {
                    type: Type.STRING,
                    description: 'Must be one of: Relevance, Clarity & Structure, Reasoning, Use of Specific Examples',
                  },
                  issue: {
                    type: Type.STRING,
                    description: 'What is weak or notable about this specific phrase.',
                  },
                  suggestion: {
                    type: Type.STRING,
                    description: 'Concrete way to improve or strengthen this specific phrase.',
                  },
                },
                required: ['quote', 'criterion', 'issue', 'suggestion'],
              },
            },
            overall_summary: {
              type: Type.STRING,
              description: '2-3 objective sentences summarizing answer strengths and main gap.',
            },
            top_3_fixes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Exactly 3 concrete, actionable steps the candidate should take next.',
            },
            improved_example: {
              type: Type.STRING,
              description: 'A strong example answer showing how to apply the top 3 fixes.',
            },
            improvement_note: {
              type: Type.STRING,
              description: 'When comparing a revised answer to a previous attempt, 1-2 sentences describing what improved.',
            },
          },
          required: ['scores', 'evidence', 'overall_summary', 'top_3_fixes', 'improved_example'],
        },
      },
    });

    const rawText = (response.text ?? '').trim();
    if (!rawText) {
      res.status(502).json({ error: 'The evaluator returned an empty response. Please retry.' });
      return;
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(rawText) as Record<string, unknown>;
    } catch {
      res.status(502).json({ error: 'Received malformed JSON from the evaluator. Please click Retry.' });
      return;
    }

    // Validate and normalize scores strictly against the 4 rubric criteria
    const rawScores = Array.isArray(parsed.scores) ? parsed.scores : [];
    const scoreMap = new Map<CriterionKey, { score: number; justification: string }>();

    for (const entry of rawScores) {
      if (!entry || typeof entry !== 'object') continue;
      const item = entry as Record<string, unknown>;
      const crit = CRITERION_ORDER.find(
        (c) => c.toLowerCase() === String(item.criterion ?? '').trim().toLowerCase()
      );
      if (!crit) continue;
      const numScore = Number(item.score);
      const clampedScore = Number.isFinite(numScore) ? Math.min(5, Math.max(1, Math.round(numScore))) : 1;
      const justification =
        typeof item.justification === 'string' && item.justification.trim()
          ? item.justification.trim()
          : 'Evaluated against the visible rubric criteria.';
      scoreMap.set(crit, { score: clampedScore, justification });
    }

    if (scoreMap.size !== 4) {
      res.status(502).json({
        error: 'Evaluation output was missing one or more rubric criterion scores. Please click Retry.',
      });
      return;
    }

    const normalizedScores = CRITERION_ORDER.map((criterion) => ({
      criterion,
      score: scoreMap.get(criterion)!.score,
      justification: scoreMap.get(criterion)!.justification,
    }));

    // Validate and recover exact substrings for evidence
    const rawEvidence = Array.isArray(parsed.evidence) ? parsed.evidence : [];
    const seenQuotes = new Set<string>();
    const normalizedEvidence: Array<{
      id: string;
      quote: string;
      criterion: CriterionKey;
      issue: string;
      suggestion: string;
    }> = [];

    rawEvidence.forEach((entry, idx) => {
      if (!entry || typeof entry !== 'object') return;
      const item = entry as Record<string, unknown>;
      const crit = CRITERION_ORDER.find(
        (c) => c.toLowerCase() === String(item.criterion ?? '').trim().toLowerCase()
      );
      if (!crit) return;

      const rawQuote = typeof item.quote === 'string' ? item.quote : '';
      const exactQuote = recoverExactSubstring(answer, rawQuote);
      if (!exactQuote) return;

      const dedupeKey = `${exactQuote}::${crit}`;
      if (seenQuotes.has(dedupeKey)) return;
      seenQuotes.add(dedupeKey);

      const issue = typeof item.issue === 'string' ? item.issue.trim() : '';
      const suggestion = typeof item.suggestion === 'string' ? item.suggestion.trim() : '';
      if (!issue || !suggestion) return;

      normalizedEvidence.push({
        id: `ev-${idx + 1}`,
        quote: exactQuote,
        criterion: crit,
        issue,
        suggestion,
      });
    });

    const overall_summary =
      typeof parsed.overall_summary === 'string' && parsed.overall_summary.trim()
        ? parsed.overall_summary.trim()
        : '';
    const top_3_fixes = Array.isArray(parsed.top_3_fixes)
      ? parsed.top_3_fixes.map((f) => String(f).trim()).filter(Boolean).slice(0, 3)
      : [];
    const improved_example =
      typeof parsed.improved_example === 'string' && parsed.improved_example.trim()
        ? parsed.improved_example.trim()
        : '';

    if (!overall_summary || top_3_fixes.length === 0 || !improved_example) {
      res.status(502).json({
        error: 'Evaluation output was incomplete. Please click Retry to run the evaluation again.',
      });
      return;
    }

    const improvement_note =
      isRevision && typeof parsed.improvement_note === 'string' && parsed.improvement_note.trim()
        ? parsed.improvement_note.trim()
        : undefined;

    res.json({
      scores: normalizedScores,
      evidence: normalizedEvidence,
      overall_summary,
      top_3_fixes,
      improved_example,
      improvement_note,
    });
  } catch (err) {
    const mapped = mapApiError(err);
    res.status(mapped.status).json({ error: mapped.message });
  }
});

app.post('/api/custom-role', async (req: Request, res: Response) => {
  try {
    const customRole = typeof req.body?.customRole === 'string' ? req.body.customRole.trim() : '';
    if (!customRole || customRole.length < 2 || customRole.length > 80) {
      res.status(400).json({ error: 'Please enter a valid target role (2–80 characters).' });
      return;
    }

    const ai = getGenAIClient();
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Create a tailored interview practice rubric and 5 mixed Behavioral and Technical practice questions for the target role: "${customRole}".
Use ONLY these exact 4 criterion names in the rubric: "Relevance", "Clarity & Structure", "Reasoning", "Use of Specific Examples".
For each criterion, provide a concise 1-line summary and crisp 1-line descriptions for level 1, level 3, and level 5 specific to "${customRole}".
For the 5 questions (mix of Behavioral and Technical), include a short focusHint, a realistic weak sample answer (demoWeakAnswer, ~40-65 words with typical candidate flaws like vagueness or missing reasoning), and a strong sample answer (demoStrongAnswer, ~90-120 words with clear structure, reasoning, and concrete specifics).`,
      config: {
        seed: 42,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subtitle: { type: Type.STRING },
            rubric: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  key: { type: Type.STRING },
                  summary: { type: Type.STRING },
                  level1: { type: Type.STRING },
                  level3: { type: Type.STRING },
                  level5: { type: Type.STRING },
                },
                required: ['key', 'summary', 'level1', 'level3', 'level5'],
              },
            },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  prompt: { type: Type.STRING },
                  focusHint: { type: Type.STRING },
                  demoWeakAnswer: { type: Type.STRING },
                  demoStrongAnswer: { type: Type.STRING },
                },
                required: ['category', 'prompt', 'focusHint', 'demoWeakAnswer', 'demoStrongAnswer'],
              },
            },
          },
          required: ['subtitle', 'rubric', 'questions'],
        },
      },
    });

    const rawText = (response.text ?? '').trim();
    if (!rawText) {
      res.status(502).json({ error: 'Received an empty response while generating the custom role. Please retry.' });
      return;
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(rawText) as Record<string, unknown>;
    } catch {
      res.status(502).json({ error: 'Could not parse generated role setup. Please retry.' });
      return;
    }

    const rawRubric = Array.isArray(parsed.rubric) ? parsed.rubric : [];
    const rubricMap = new Map<CriterionKey, RubricInput>();
    for (const item of rawRubric) {
      if (!item || typeof item !== 'object') continue;
      const r = item as Record<string, unknown>;
      const key = CRITERION_ORDER.find(
        (c) => c.toLowerCase() === String(r.key ?? '').trim().toLowerCase()
      );
      if (!key) continue;
      rubricMap.set(key, {
        key,
        summary: String(r.summary ?? '').trim(),
        level1: String(r.level1 ?? '').trim(),
        level3: String(r.level3 ?? '').trim(),
        level5: String(r.level5 ?? '').trim(),
      });
    }

    if (rubricMap.size !== 4) {
      res.status(502).json({ error: 'Generated rubric was incomplete. Please retry.' });
      return;
    }

    const rawQuestions = Array.isArray(parsed.questions) ? parsed.questions : [];
    const questions = rawQuestions
      .slice(0, 5)
      .map((item, idx) => {
        const q = (item ?? {}) as Record<string, unknown>;
        const catRaw = String(q.category ?? '').toLowerCase();
        const category: 'Behavioral' | 'Technical' = catRaw.includes('tech') ? 'Technical' : 'Behavioral';
        return {
          id: `custom-${idx + 1}`,
          category,
          prompt: String(q.prompt ?? '').trim(),
          focusHint: String(q.focusHint ?? '').trim(),
          demoWeakAnswer: String(q.demoWeakAnswer ?? '').trim(),
          demoStrongAnswer: String(q.demoStrongAnswer ?? '').trim(),
        };
      })
      .filter((q) => q.prompt.length > 0);

    if (questions.length < 5) {
      res.status(502).json({ error: 'Generated question set was incomplete. Please retry.' });
      return;
    }

    res.json({
      id: `custom-${Date.now()}`,
      title: customRole,
      subtitle: typeof parsed.subtitle === 'string' ? parsed.subtitle.trim() : `Tailored rubric and practice questions for ${customRole}`,
      isCustom: true,
      rubric: CRITERION_ORDER.map((k) => ({
        ...rubricMap.get(k)!,
        label: k,
      })),
      questions,
    });
  } catch (err) {
    const mapped = mapApiError(err);
    res.status(mapped.status).json({ error: mapped.message });
  }
});

async function startServer() {
  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`InterviewMirror server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
