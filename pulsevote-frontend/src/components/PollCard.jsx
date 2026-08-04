import { useEffect, useState } from "react";
import api from "../api/api";
import { getErrorMessage } from "../utils/messages";

export default function PollCard({ poll, canManage, canVote, onPollChanged }) {
  const [selectedOptionIndex, setSelectedOptionIndex] = useState("");
  const [results, setResults] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadResults() {
    try {
      const response = await api.get(`/polls/get-poll-results/${poll._id}`);
      setResults(response.data.results);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }

  useEffect(() => {
    loadResults();
  }, [poll._id]);

  async function vote(event) {
    event.preventDefault();
    if (selectedOptionIndex === "") {
      setError("Select an option before voting.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");
    try {
      await api.post(`/polls/vote/${poll._id}`, { optionIndex: Number(selectedOptionIndex) });
      setMessage("Vote recorded.");
      await loadResults();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  async function changeStatus() {
    const action = poll.status === "open" ? "close" : "open";
    setLoading(true);
    setError("");
    try {
      await api.post(`/polls/${action}/${poll._id}`);
      await onPollChanged();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  const alreadyVoted = results?.userVoteIndex !== null && results?.userVoteIndex !== undefined;

  return (
    <article className="poll-card">
      <div className="poll-heading">
        <h4>{poll.question}</h4>
        <span className={`status ${poll.status}`}>{poll.status}</span>
      </div>
      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      {canVote && poll.status === "open" && !alreadyVoted && (
        <form onSubmit={vote} className="option-list">
          {poll.options.map((option, index) => (
            <label key={`${poll._id}-${index}`} className="option-row">
              <input type="radio" name={`poll-${poll._id}`} value={index} checked={Number(selectedOptionIndex) === index} onChange={(e) => setSelectedOptionIndex(e.target.value)} />
              {option}
            </label>
          ))}
          <button disabled={loading}>{loading ? "Submitting..." : "Vote"}</button>
        </form>
      )}

      {canVote && poll.status === "closed" && <p>This poll is closed.</p>}
      {alreadyVoted && <p>Your vote has already been recorded.</p>}

      {results && (
        <div className="results">
          <strong>Total votes: {results.totalVotes}</strong>
          {poll.options.map((option, index) => (
            <div className="result-row" key={`${poll._id}-result-${index}`}>
              <span>{option}{results.userVoteIndex === index ? " (your vote)" : ""}</span>
              <span>{results.counts[index]} votes — {results.percentages[index]}%</span>
            </div>
          ))}
        </div>
      )}

      {canManage && (
        <button className="secondary" onClick={changeStatus} disabled={loading}>
          {poll.status === "open" ? "Close Poll" : "Open Poll"}
        </button>
      )}
    </article>
  );
}