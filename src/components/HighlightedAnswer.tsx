import { useMemo } from 'react';
import { EvidenceItem } from '../types';
import { CRITERION_STYLES } from '../constants/criteria';

interface HighlightedAnswerProps {
  answer: string;
  evidence: EvidenceItem[];
  selectedEvidenceId: string | null;
  onSelectEvidence: (id: string) => void;
}

interface TextSegment {
  text: string;
  evidence?: EvidenceItem;
}

function buildSegments(answer: string, evidence: EvidenceItem[]): TextSegment[] {
  if (!answer || evidence.length === 0) {
    return [{ text: answer }];
  }

  const matches: Array<{ start: number; end: number; item: EvidenceItem }> = [];

  for (const item of evidence) {
    if (!item.quote) continue;
    let searchFrom = 0;
    let idx = answer.indexOf(item.quote, searchFrom);
    while (idx !== -1) {
      const end = idx + item.quote.length;
      const overlaps = matches.some((m) => !(end <= m.start || idx >= m.end));
      if (!overlaps) {
        matches.push({ start: idx, end, item });
        break;
      }
      searchFrom = idx + 1;
      idx = answer.indexOf(item.quote, searchFrom);
    }
  }

  matches.sort((a, b) => a.start - b.start);

  const segments: TextSegment[] = [];
  let cursor = 0;

  for (const match of matches) {
    if (match.start > cursor) {
      segments.push({ text: answer.slice(cursor, match.start) });
    }
    segments.push({
      text: answer.slice(match.start, match.end),
      evidence: match.item,
    });
    cursor = match.end;
  }

  if (cursor < answer.length) {
    segments.push({ text: answer.slice(cursor) });
  }

  return segments;
}

export function HighlightedAnswer({
  answer,
  evidence,
  selectedEvidenceId,
  onSelectEvidence,
}: HighlightedAnswerProps) {
  const segments = useMemo(() => buildSegments(answer, evidence), [answer, evidence]);

  return (
    <div className="whitespace-pre-wrap text-[15px] leading-7 text-[#14163F]">
      {segments.map((seg, idx) => {
        if (!seg.evidence) {
          return <span key={idx}>{seg.text}</span>;
        }
        const ev = seg.evidence;
        const style = CRITERION_STYLES[ev.criterion];
        const isSelected = selectedEvidenceId === ev.id;

        return (
          <button
            key={`${ev.id}-${idx}`}
            type="button"
            onClick={() => onSelectEvidence(ev.id)}
            title={`${ev.criterion}: click to inspect feedback`}
            className={`inline rounded px-1.5 py-0.5 text-left font-medium transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#14163F] ${
              style.highlightText
            } ${style.highlightBorder} ${
              isSelected ? style.activeRing : style.highlightBg
            }`}
          >
            {seg.text}
          </button>
        );
      })}
    </div>
  );
}
