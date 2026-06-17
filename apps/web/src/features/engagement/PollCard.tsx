"use client";
import { useState } from "react";
import { useVotePoll, usePollResults } from "../../hooks/useApi";

/** Gonderiye gomulu anket. Oy verince canli sonuc yuzdelerini gosterir. */
export function PollCard({ poll }: { poll: { id: string; question: string; options: { id: string; label: string }[] } }) {
  const vote = useVotePoll(poll.id);
  const results = usePollResults(poll.id);
  const [voted, setVoted] = useState(false);

  const onVote = (optionId: string) => {
    vote.mutate(optionId, { onSuccess: () => setVoted(true) });
  };

  const resultMap = new Map((results.data?.options ?? []).map((o: any) => [o.id, o]));

  return (
    <div className="poll-card">
      <div className="poll-q">{poll.question} <span className="muted">(anket)</span></div>
      <div className="poll-options">
        {poll.options.map((opt) => {
          const r: any = resultMap.get(opt.id);
          const pct = r?.pct ?? 0;
          return (
            <button key={opt.id} className="poll-opt" disabled={voted || vote.isPending} onClick={() => onVote(opt.id)}>
              {(voted || results.data) && <div className="poll-bar" style={{ width: `${pct}%` }} />}
              <span className="poll-label">{opt.label}{(voted || results.data) ? ` · ${pct}%` : ""}</span>
            </button>
          );
        })}
      </div>
      {results.data && <div className="poll-total muted">{results.data.total} oy</div>}
    </div>
  );
}
