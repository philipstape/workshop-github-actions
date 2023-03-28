const { Octokit } = require('@octokit/rest');
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const owner = process.env.GITHUB_REPOSITORY_OWNER;
const repo = process.env.GITHUB_REPOSITORY;

async function getIssuesInColumn(columnId) {
  const { data: cards } = await octokit.projects.listCards({ column_id: columnId });
  const issues = [];

  for (const card of cards) {
    if (card.content_url) {
      const issueNumber = card.content_url.split('/').pop();
      issues.push(`#${issueNumber}`);
    }
  }

  return issues;
}

async function createIssueWithReferences() {
  const columnId = parseInt(process.env.COLUMN_ID);
  const issues = await getIssuesInColumn(columnId);

  if (issues.length) {
    const issueBody = `This issue contains references to all issues in the specified column:\n\n${issues.join('\n')}`;
    await octokit.issues.create({ owner, repo, title: 'Summary of Issues in Column', body: issueBody });
  } else {
    console.log('No issues found in the specified column.');
  }
}

createIssueWithReferences().catch(error => {
  console.error(error);
  process.exit(1);
});
