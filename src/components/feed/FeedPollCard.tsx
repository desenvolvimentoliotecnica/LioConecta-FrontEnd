import { useMemo, useState } from "react";
import type { FeedPostDto, PollDto } from "../../api/types";
import { useVotePoll } from "../../api/hooks/useFeed";
import "./feed-poll.css";

const DEFAULT_HERO = "/bg-poll.png";

type Props = {
  poll: PollDto;
  heroImageUrl?: string;
};

function isPollClosed(poll: PollDto): boolean {
  if (!poll.endsAt) return false;
  return new Date(poll.endsAt).getTime() <= Date.now();
}

function getHeroImage(metadata: Record<string, unknown>): string {
  const hero = metadata.heroImageUrl;
  return typeof hero === "string" && hero.trim() ? hero : DEFAULT_HERO;
}

export function getPollHeroImage(post: FeedPostDto): string {
  return getHeroImage(post.metadata);
}

export function FeedPollBody({ poll, heroImageUrl }: Props) {
  const votePoll = useVotePoll();
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [voteError, setVoteError] = useState<string | null>(null);

  const closed = isPollClosed(poll);
  const showResults = poll.hasViewerVoted || closed;
  const totalVotes = useMemo(
    () => poll.options.reduce((sum, option) => sum + option.voteCount, 0),
    [poll.options],
  );

  const activeSelection =
    poll.options.find((option) => option.isSelectedByViewer)?.id ??
    selectedOptionId;

  const isVoting =
    votePoll.isPending && votePoll.variables?.postId === poll.postId;

  async function handleVote() {
    if (!selectedOptionId || poll.hasViewerVoted || closed || isVoting) {
      return;
    }

    setVoteError(null);

    try {
      await votePoll.mutateAsync({
        postId: poll.postId,
        optionId: selectedOptionId,
      });
    } catch {
      setVoteError("Não foi possível registrar seu voto. Tente novamente.");
    }
  }

  return (
    <div className="poll">
      <div className="poll__banner">
        <img src={heroImageUrl ?? DEFAULT_HERO} alt="" />
      </div>
      <div className="poll__content">
        <div className="poll__header">
          <div className="poll__title">{poll.question}</div>
          <span className="badge badge--enquete">Enquete</span>
        </div>

        {closed ? (
          <p className="feed-poll-card__status feed-poll-card__status--closed">
            Enquete encerrada
          </p>
        ) : poll.hasViewerVoted ? (
          <p className="feed-poll-card__status">Você já votou nesta enquete</p>
        ) : null}

        <div className="poll__options">
          {poll.options.map((option) => {
            const pct =
              showResults && totalVotes > 0
                ? Math.round((option.voteCount / totalVotes) * 100)
                : 0;
            const isSelected = activeSelection === option.id;

            if (showResults) {
              return (
                <div
                  key={option.id}
                  className={`poll__option${isSelected ? " poll__option--selected" : ""}`}
                >
                  <span className={`poll__radio${isSelected ? " poll__radio--checked" : ""}`} />
                  <div className="poll__option-content">
                    <span className="poll__label">{option.text}</span>
                    <div className="poll__bar-wrap">
                      <div className="poll__bar" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <span className="poll__pct">{pct}%</span>
                </div>
              );
            }

            return (
              <button
                key={option.id}
                type="button"
                className={`poll__option poll__option--interactive${isSelected ? " poll__option--selected" : ""}`}
                onClick={() => setSelectedOptionId(option.id)}
                disabled={isVoting}
              >
                <span className={`poll__radio${isSelected ? " poll__radio--checked" : ""}`} />
                <div className="poll__option-content">
                  <span className="poll__label">{option.text}</span>
                </div>
              </button>
            );
          })}
        </div>

        {!showResults ? (
          <>
            <button
              type="button"
              className="btn poll__vote-btn"
              disabled={!selectedOptionId || isVoting}
              onClick={() => void handleVote()}
            >
              {isVoting ? "Registrando…" : "Votar"}
            </button>
            {voteError ? (
              <p className="poll__vote-error" role="alert">
                {voteError}
              </p>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
