import { validateSettings } from './settingsSchema.js';
import { originalBodies, upgrades } from './game.js';

// Credentials live only in this tab's memory, never in storage or game settings.
export function createGithubAdmin(fetcher = fetch) {
  let token = '';
  const base = 'https://api.github.com/repos/jihn0311/blackhole';
  async function request(path, options = {}) {
    if (!token) throw new Error('저장소 수정 권한이 있는 GitHub 토큰으로 연결해주세요.');
    const response = await fetcher(base + path, {
      ...options, cache: 'no-store',
      headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      if ([409, 422].includes(response.status)) throw new Error('공개 설정이 바뀌었습니다. 다시 불러온 뒤 비교해주세요.');
      if ([401, 403, 404].includes(response.status)) throw new Error('GitHub 토큰과 blackhole 저장소 권한을 확인해주세요.');
      throw new Error(`GitHub 연결 실패 (${response.status})`);
    }
    return response.json();
  }
  async function remote() {
    const file = await request('/contents/src/gameSettings.json?ref=main');
    const text = new TextDecoder().decode(Uint8Array.from(atob(file.content.replace(/\s/g, '')), c => c.charCodeAt(0)));
    return { config: validateSettings(JSON.parse(text)), sha: file.sha };
  }
  return async (path, data) => {
    if (path === 'login') {
      token = data.password.trim();
      try {
        const repo = await request('');
        if (!repo.permissions?.push) throw new Error('이 저장소를 수정할 수 있는 계정으로 연결해주세요.');
        await remote();
        return { ok: true };
      } catch (error) { token = ''; throw error; }
    }
    if (path === 'logout') { token = ''; return { ok: true }; }
    if (path === 'remote') return remote();
    if (path === 'local') {
      const value = await remote();
      return { ...value, revision: value.sha, bodies: originalBodies, upgrades };
    }
    if (path.startsWith('deployment?sha=')) {
      const sha = path.slice('deployment?sha='.length);
      if (!/^[a-f0-9]{40}$/.test(sha)) throw new Error('잘못된 배포 번호입니다.');
      const result = await request(`/actions/runs?head_sha=${sha}&per_page=10`);
      const run = result.workflow_runs.find(r => r.head_sha === sha && r.name === 'Deploy game to GitHub Pages');
      return run ? { status: run.status, conclusion: run.conclusion, url: run.html_url } : { status: 'waiting' };
    }
    if (path === 'publish') {
      const config = validateSettings(data.config);
      const current = await remote();
      if (current.sha !== data.sha) throw new Error('공개 설정이 바뀌었습니다. 공개 설정을 다시 확인해주세요.');
      const bytes = new TextEncoder().encode(JSON.stringify(config, null, 2) + '\n');
      const content = btoa(Array.from(bytes, b => String.fromCharCode(b)).join(''));
      const result = await request('/contents/src/gameSettings.json', { method: 'PUT', body: JSON.stringify({ message: 'Update game settings from web admin', content, sha: current.sha, branch: 'main' }) });
      return { commit: result.commit.sha, sha: result.content.sha, revision: result.content.sha, localSynced: true };
    }
    throw new Error('지원하지 않는 요청입니다.');
  };
}
