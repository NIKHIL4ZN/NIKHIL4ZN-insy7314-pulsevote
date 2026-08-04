import { useEffect, useState } from "react";
import api from "../api/api";
import { saveToken } from "../utils/auth";
import { getErrorMessage } from "../utils/messages";
import OrganisationSelector from "./OrganisationSelector";
import PollCard from "./PollCard";

export default function UserDashboard() {
  const [joinCode, setJoinCode] = useState("");
  const [organisations, setOrganisations] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [polls, setPolls] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadOrganisations(preferredId) {
    const response = await api.get("/organisations/my-organisations");
    setOrganisations(response.data);
    setSelectedId(preferredId || selectedId || response.data[0]?._id || "");
  }

  async function loadPolls() {
    if (!selectedId) {
      setPolls([]);
      return;
    }
    const response = await api.get(`/polls/get-polls/${selectedId}`);
    setPolls(response.data);
  }

  useEffect(() => {
    loadOrganisations().catch((requestError) => setError(getErrorMessage(requestError)));
  }, []);

  useEffect(() => {
    loadPolls().catch((requestError) => setError(getErrorMessage(requestError)));
  }, [selectedId]);

  async function joinOrganisation(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const response = await api.post("/organisations/join-organisation", { joinCode });
      saveToken(response.data.token);
      setJoinCode("");
      setMessage(`Joined ${response.data.organisation.name}. Access token refreshed.`);
      await loadOrganisations(response.data.organisation._id);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel">
      <h3>User Dashboard</h3>
      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={joinOrganisation} className="form-stack compact-form">
        <h4>Join Organisation</h4>
        <label>Join code<input value={joinCode} onChange={(e) => setJoinCode(e.target.value)} required /></label>
        <button disabled={loading}>{loading ? "Joining..." : "Join"}</button>
      </form>

      <OrganisationSelector organisations={organisations} selectedId={selectedId} onChange={setSelectedId} />

      {!organisations.length && <p>Join an organisation to view its polls.</p>}
      <div className="poll-list">
        {polls.map((poll) => <PollCard key={poll._id} poll={poll} canManage={false} canVote onPollChanged={loadPolls} />)}
      </div>
    </section>
  );
}