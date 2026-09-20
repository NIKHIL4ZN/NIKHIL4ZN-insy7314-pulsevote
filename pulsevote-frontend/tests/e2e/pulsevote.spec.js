import {
  expect,
  test
} from "@playwright/test";

function makeToken({
  email = "user@test.com",
  roles = [
    {
      role: "user",
      organisationId: "org-1"
    }
  ]
} = {}) {
  const encode = (value) =>
    Buffer
      .from(JSON.stringify(value))
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

  return `${encode({
    alg: "none",
    typ: "JWT"
  })}.${encode({
    email,
    roles,
    exp:
      Math.floor(Date.now() / 1000) +
      3600
  })}.signature`;
}

async function mockApi(
  page,
  role = "user"
) {
  const token = makeToken({
    email: `${role}@test.com`,
    roles: [
      {
        role,
        organisationId:
          role === "admin"
            ? null
            : "org-1"
      }
    ]
  });

  let results = {
    counts: [0, 0],
    percentages: [0, 0],
    totalVotes: 0,
    userVoteIndex: null
  };

  await page.route(
    "**/*",
    async (route) => {
      const request =
        route.request();

      const url =
        request.url();

      const pathname =
        new URL(url).pathname;

      const method =
        request.method();

      // Only mock real backend API calls.
      // Do not intercept frontend files such as:
      // /src/api/api.js
      if (
        !pathname.startsWith(
          "/api/"
        )
      ) {
        return route.continue();
      }

      if (
        url.endsWith(
          "/api/auth/login"
        ) &&
        method === "POST"
      ) {
        const body =
          request.postDataJSON();

        if (
          body.password ===
          "WrongPassword1"
        ) {
          return route.fulfill({
            status: 401,
            contentType:
              "application/json",
            body: JSON.stringify({
              message:
                "Invalid credentials"
            })
          });
        }

        return route.fulfill({
          status: 200,
          contentType:
            "application/json",
          body: JSON.stringify({
            token
          })
        });
      }

      if (
        url.endsWith(
          "/api/auth/register-user"
        ) &&
        method === "POST"
      ) {
        return route.fulfill({
          status: 201,
          contentType:
            "application/json",
          body: JSON.stringify({
            token
          })
        });
      }

      if (
        url.endsWith(
          "/api/organisations/my-organisations"
        ) &&
        method === "GET"
      ) {
        return route.fulfill({
          status: 200,
          contentType:
            "application/json",
          body: JSON.stringify([
            {
              _id: "org-1",
              name: "INSY Class",
              joinCode: "JOIN123"
            }
          ])
        });
      }

      if (
        url.includes(
          "/api/polls/get-polls/org-1"
        ) &&
        method === "GET"
      ) {
        return route.fulfill({
          status: 200,
          contentType:
            "application/json",
          body: JSON.stringify([
            {
              _id: "poll-1",
              organisationId:
                "org-1",
              question:
                "Best CI tool?",
              options: [
                "GitHub Actions",
                "Other"
              ],
              status: "open"
            }
          ])
        });
      }

      if (
        url.includes(
          "/api/polls/get-poll-results/poll-1"
        ) &&
        method === "GET"
      ) {
        return route.fulfill({
          status: 200,
          contentType:
            "application/json",
          body: JSON.stringify({
            results
          })
        });
      }

      if (
        url.includes(
          "/api/polls/vote/poll-1"
        ) &&
        method === "POST"
      ) {
        results = {
          counts: [1, 0],
          percentages: [100, 0],
          totalVotes: 1,
          userVoteIndex: 0
        };

        return route.fulfill({
          status: 200,
          contentType:
            "application/json",
          body: JSON.stringify({
            message:
              "Vote recorded"
          })
        });
      }

      if (
        url.includes(
          "/api/polls/close/poll-1"
        ) &&
        method === "POST"
      ) {
        return route.fulfill({
          status: 200,
          contentType:
            "application/json",
          body: JSON.stringify({
            message:
              "Poll closed"
          })
        });
      }

      return route.fulfill({
        status: 200,
        contentType:
          "application/json",
        body: JSON.stringify({})
      });
    }
  );
}

async function login(
  page,
  role = "user"
) {
  await mockApi(
    page,
    role
  );

  await page.goto(
    "/login"
  );

  await page
    .getByLabel("Email")
    .fill(
      `${role}@test.com`
    );

  await page
    .getByLabel(
      "Password",
      {
        exact: true
      }
    )
    .fill(
      "Password123!"
    );

  await page
    .getByRole(
      "button",
      {
        name: "Login"
      }
    )
    .click();

  await expect(
    page
  ).toHaveURL(
    /\/dashboard$/
  );
}

test(
  "home page loads and exposes the authentication navigation",
  async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole(
        "heading",
        {
          name: "PulseVote",
          exact: true
        }
      )
    ).toBeVisible();

    await expect(
      page.getByRole(
        "link",
        {
          name: "Login"
        }
      )
    ).toBeVisible();

    await expect(
      page.getByRole(
        "link",
        {
          name: "Register"
        }
      )
    ).toBeVisible();
  }
);

test(
  "protected dashboard redirects an unauthenticated visitor to login",
  async ({ page }) => {
    await page.goto(
      "/dashboard"
    );

    await expect(
      page
    ).toHaveURL(
      /\/login$/
    );
  }
);

test(
  "failed login shows the backend error without leaving the login page",
  async ({ page }) => {
    await mockApi(page);

    await page.goto(
      "/login"
    );

    await page
      .getByLabel("Email")
      .fill(
        "user@test.com"
      );

    await page
      .getByLabel(
        "Password",
        {
          exact: true
        }
      )
      .fill(
        "WrongPassword1"
      );

    await page
      .getByRole(
        "button",
        {
          name: "Login"
        }
      )
      .click();

    await expect(
      page.getByText(
        "Invalid credentials"
      )
    ).toBeVisible();

    await expect(
      page
    ).toHaveURL(
      /\/login$/
    );
  }
);

test(
  "successful login opens the role-specific dashboard",
  async ({ page }) => {
    await login(
      page,
      "user"
    );

    await expect(
      page.getByRole(
        "heading",
        {
          name: "Dashboard",
          exact: true
        }
      )
    ).toBeVisible();

    await expect(
      page.getByRole(
        "heading",
        {
          name:
            "User Dashboard"
        }
      )
    ).toBeVisible();

    await expect(
      page.getByText(
        "Signed in as"
      )
    ).toContainText(
      "user@test.com"
    );
  }
);

test(
  "a user can view a poll, vote and see updated results",
  async ({ page }) => {
    await login(
      page,
      "user"
    );

    await expect(
      page.getByRole(
        "heading",
        {
          name:
            "Best CI tool?"
        }
      )
    ).toBeVisible();

    await page
      .getByLabel(
        "GitHub Actions"
      )
      .check();

    await page
      .getByRole(
        "button",
        {
          name: "Vote"
        }
      )
      .click();

    await expect(
      page.getByText(
        "Vote recorded."
      )
    ).toBeVisible();

    await expect(
      page.getByText(
        "Total votes: 1"
      )
    ).toBeVisible();

    await expect(
      page.getByText(
        "GitHub Actions (your vote)"
      )
    ).toBeVisible();
  }
);

test(
  "logout clears the session and protects the dashboard again",
  async ({ page }) => {
    await login(
      page,
      "user"
    );

    await page
      .getByRole(
        "link",
        {
          name: "Logout"
        }
      )
      .click();

    await expect(
      page
    ).toHaveURL(
      /\/$/
    );

    await page.goto(
      "/dashboard"
    );

    await expect(
  page
).toHaveURL(
  /\/login$/
);
  }
);