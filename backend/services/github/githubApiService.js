const { Octokit } = require('@octokit/rest');

async function getPortfolioData(accessToken) {
  const octokit = new Octokit({ auth: accessToken });

  // Pagination handled for you by octokit.paginate
  const repos = await octokit.paginate(octokit.repos.listForAuthenticatedUser, {
    per_page: 100,
    sort: 'updated',
  });

  const nonForkRepos = repos.filter(r => !r.fork).slice(0, 15); // cap to avoid rate-limit burn

  const enriched = [];
  for (const repo of nonForkRepos) {
    const [languages, readme, commits] = await Promise.allSettled([
      octokit.repos.listLanguages({ owner: repo.owner.login, repo: repo.name }),
      octokit.repos.getReadme({ owner: repo.owner.login, repo: repo.name }).catch(() => null),
      octokit.repos.listCommits({ owner: repo.owner.login, repo: repo.name, per_page: 30 }).catch(() => ({ data: [] })),
    ]);

    enriched.push({
      name: repo.name,
      description: repo.description,
      stars: repo.stargazers_count,
      languages: languages.status === 'fulfilled' ? languages.value.data : {},
      hasReadme: readme?.status === 'fulfilled' && !!readme.value,
      commitCount: commits.status === 'fulfilled' ? commits.value.data.length : 0,
      lastPushed: repo.pushed_at,
    });
  }

  return { repos: enriched, rateLimit: await octokit.rateLimit.get() };
}

module.exports = { getPortfolioData };