import { useEffect, useState } from "react";
import api from "../api/api";
import { saveToken } from "../utils/auth";
import { getErrorMessage } from "../utils/messages";
import OrganisationSelector from "./OrganisationSelector";
import PollCard from "./PollCard";

export default function ManagerDashboard() {
  const [organisations, setOrganisations] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [polls, setPolls] = useState([]);

  const [organisationName, setOrganisationName] = useState("");
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedOrganisation = organisations.find(
    (organisation) => organisation._id === selectedId
  );

  async function loadOrganisations(preferredId) {
    const response = await api.get("/organisations/my-organisations");

    setOrganisations(response.data);

    const nextId =
      preferredId ||
      selectedId ||
      response.data[0]?._id ||
      "";

    setSelectedId(nextId);
  }

  async function loadPolls() {
    if (!selectedId) {
      setPolls([]);
      return;
    }

    const response = await api.get(
      `/polls/get-polls/${selectedId}`
    );

    setPolls(response.data);
  }

  useEffect(() => {
    loadOrganisations().catch((err) =>
      setError(getErrorMessage(err))
    );
  }, []);

  useEffect(() => {
    loadPolls().catch((err) =>
      setError(getErrorMessage(err))
    );
  }, [selectedId]);

  async function createOrganisation(event) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await api.post(
        "/organisations/create-organisation",
        {
          name: organisationName
        }
      );

      saveToken(response.data.token);

      setOrganisationName("");

      setMessage(
        "Organisation created and access token refreshed."
      );

      await loadOrganisations(response.data.organisation._id);

    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function regenerateJoinCode() {
    setLoading(true);
    setMessage("");
    setError("");

    try {
      await api.post(
        `/organisations/generate-join-code/${selectedId}`
      );

      setMessage(
        "A new join code was generated. The old code no longer works."
      );

      await loadOrganisations(selectedId);

    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  function updateOption(index, value) {
    setOptions((current) =>
      current.map((option, optionIndex) =>
        optionIndex === index ? value : option
      )
    );
  }

  async function createPoll(event) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const cleanedOptions = options
        .map((option) => option.trim())
        .filter(Boolean);

      await api.post("/polls/create-poll", {
        organisationId: selectedId,
        question,
        options: cleanedOptions
      });

      setQuestion("");
      setOptions(["", ""]);

      setMessage("Poll created.");

      await loadPolls();

    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel">
      <h3>Manager Dashboard</h3>

      {message && (
        <div className="success-message">
          {message}
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form
        onSubmit={createOrganisation}
        className="form-stack compact-form"
      >
        <h4>Create Organisation</h4>

        <label>
          Name
          <input
            value={organisationName}
            onChange={(e) =>
              setOrganisationName(e.target.value)
            }
            required
          />
        </label>

        <button disabled={loading}>
          Create Organisation
        </button>
      </form>

      <OrganisationSelector
        organisations={organisations}
        selectedId={selectedId}
        onChange={setSelectedId}
      />

      {selectedOrganisation && (
        <div className="organisation-summary">
          <p>
            <strong>ID:</strong>{" "}
            {selectedOrganisation._id}
          </p>

          <p>
            <strong>Join code:</strong>{" "}
            <code>{selectedOrganisation.joinCode}</code>
          </p>

          <button
            className="secondary"
            onClick={regenerateJoinCode}
            disabled={loading}
          >
            Generate New Join Code
          </button>
        </div>
      )}

      {selectedId && (
        <form
          onSubmit={createPoll}
          className="form-stack compact-form"
        >
          <h4>Create Poll</h4>

          <label>
            Question
            <input
              value={question}
              onChange={(e) =>
                setQuestion(e.target.value)
              }
              required
            />
          </label>

          {options.map((option, index) => (
            <div
              className="option-editor"
              key={index}
            >
              <input
                value={option}
                onChange={(e) =>
                  updateOption(index, e.target.value)
                }
                placeholder={`Option ${index + 1}`}
                required={index < 2}
              />

              {options.length > 2 && (
                <button
                  type="button"
                  className="danger"
                  onClick={() =>
                    setOptions(
                      options.filter(
                        (_, optionIndex) =>
                          optionIndex !== index
                      )
                    )
                  }
                >
                  Remove
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            className="secondary"
            onClick={() =>
              setOptions([...options, ""])
            }
          >
            Add Option
          </button>

          <button disabled={loading}>
            Create Poll
          </button>
        </form>
      )}

      <div className="poll-list">
        {polls.map((poll) => (
          <PollCard
            key={poll._id}
            poll={poll}
            canManage
            canVote={false}
            onPollChanged={loadPolls}
          />
        ))}
      </div>
    </section>
  );
}