import {
  render,
  screen,
  waitFor
} from "@testing-library/react";

import userEvent from "@testing-library/user-event";

import {
  beforeEach,
  describe,
  expect,
  it,
  vi
} from "vitest";

import PollCard from "./PollCard";
import api from "../api/api";

vi.mock("../api/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn()
  }
}));

const poll = {
  _id: "poll-1",
  question: "Which deployment platform?",
  options: [
    "Render",
    "Other"
  ],
  status: "open"
};

describe("PollCard", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    api.get.mockResolvedValue({
      data: {
        results: {
          counts: [0, 0],
          percentages: [0, 0],
          totalVotes: 0,
          userVoteIndex: null
        }
      }
    });
  });

  it("requires an option before voting", async () => {
    const user = userEvent.setup();

    render(
      <PollCard
        poll={poll}
        canManage={false}
        canVote
        onPollChanged={vi.fn()}
      />
    );

    await screen.findByText(
      "Total votes: 0"
    );

    await user.click(
      screen.getByRole(
        "button",
        { name: "Vote" }
      )
    );

    expect(
      screen.getByText(
        "Select an option before voting."
      )
    ).toBeInTheDocument();

    expect(
      api.post
    ).not.toHaveBeenCalled();
  });

  it("submits the selected option and refreshes the results", async () => {
    const user = userEvent.setup();

    api.get
      .mockResolvedValueOnce({
        data: {
          results: {
            counts: [0, 0],
            percentages: [0, 0],
            totalVotes: 0,
            userVoteIndex: null
          }
        }
      })
      .mockResolvedValueOnce({
        data: {
          results: {
            counts: [1, 0],
            percentages: [100, 0],
            totalVotes: 1,
            userVoteIndex: 0
          }
        }
      });

    api.post.mockResolvedValueOnce({
      data: {
        message: "Vote recorded"
      }
    });

    render(
      <PollCard
        poll={poll}
        canManage={false}
        canVote
        onPollChanged={vi.fn()}
      />
    );

    await screen.findByText(
      "Total votes: 0"
    );

    await user.click(
      screen.getByLabelText("Render")
    );

    await user.click(
      screen.getByRole(
        "button",
        { name: "Vote" }
      )
    );

    expect(
      api.post
    ).toHaveBeenCalledWith(
      "/polls/vote/poll-1",
      {
        optionIndex: 0
      }
    );

    expect(
      await screen.findByText(
        "Vote recorded."
      )
    ).toBeInTheDocument();

    expect(
      await screen.findByText(
        "Total votes: 1"
      )
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Render (your vote)"
      )
    ).toBeInTheDocument();
  });

  it("allows a manager to close an open poll", async () => {
    const user = userEvent.setup();

    const onPollChanged =
      vi.fn().mockResolvedValue(undefined);

    api.post.mockResolvedValueOnce({
      data: {
        message: "Poll closed"
      }
    });

    render(
      <PollCard
        poll={poll}
        canManage
        canVote={false}
        onPollChanged={onPollChanged}
      />
    );

    await screen.findByText(
      "Total votes: 0"
    );

    await user.click(
      screen.getByRole(
        "button",
        { name: "Close Poll" }
      )
    );

    expect(
      api.post
    ).toHaveBeenCalledWith(
      "/polls/close/poll-1"
    );

    await waitFor(() =>
      expect(
        onPollChanged
      ).toHaveBeenCalled()
    );
  });
});