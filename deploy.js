const https = require('https');
const fs = require('fs');

const TOKEN = process.env.GH_TOKEN || '';
const OWNER = 'wangjinbiao0601-max';
const REPO = 'hanzi';
const FILE = 'index.html';
const BRANCH = 'main';
const LOCAL = 'E:/三马/workbuddy/小程序/汉字游戏/preview.html';

function api(method, urlPath, data) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'api.github.com',
      path: `/repos/${OWNER}/${REPO}/${urlPath}`,
      method,
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'node-deploy',
        'Accept': 'application/vnd.github.v3+json',
      },
    };
    const req = https.request(opts, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        const parsed = body ? JSON.parse(body) : {};
        if (res.statusCode >= 200 && res.statusCode < 300) resolve(parsed);
        else reject({ status: res.statusCode, body: parsed });
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function main() {
  const content = fs.readFileSync(LOCAL).toString('base64');

  // 1. Get default branch or create initial commit
  let repoInfo;
  try { repoInfo = await api('GET', ''); } catch (e) { /* empty repo */ }

  if (!repoInfo || !repoInfo.default_branch) {
    console.log('Empty repo, creating initial commit...');
    // Create blob
    const blob = await api('POST', 'git/blobs', { content, encoding: 'base64' });
    console.log('Blob:', blob.sha.slice(0, 8));

    // Create tree
    const tree = await api('POST', 'git/trees', {
      tree: [{ path: FILE, mode: '100644', type: 'blob', sha: blob.sha }],
    });
    console.log('Tree:', tree.sha.slice(0, 8));

    // Create commit
    const commit = await api('POST', 'git/commits', {
      message: 'feat: 汉字消消乐完整版 - 主界面+10关游戏',
      tree: tree.sha,
      parents: [],
    });
    console.log('Commit:', commit.sha.slice(0, 8));

    // Create branch
    await api('POST', 'git/refs', {
      ref: 'refs/heads/main',
      sha: commit.sha,
    });
    console.log('Branch main created!');
  } else {
    console.log('Repo exists, updating file...');
    let sha = null;
    try {
      const existing = await api('GET', `contents/${FILE}`);
      sha = existing.sha;
    } catch (e) { /* new file */ }

    await api('PUT', `contents/${FILE}`, {
      message: 'update: 汉字消消乐',
      content,
      branch: BRANCH,
      ...(sha ? { sha } : {}),
    });
  }

  console.log('SUCCESS!');
  console.log(`Live: https://${OWNER}.github.io/${REPO}/`);
}

main().catch(e => {
  console.error('FAILED:', e.status || e.message);
  if (e.body) console.error(JSON.stringify(e.body));
});
