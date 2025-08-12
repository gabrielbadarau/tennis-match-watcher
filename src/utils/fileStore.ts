import fs from 'node:fs/promises';
import path from 'node:path';
import env from '../config/env';

export interface MatchState {
  sig: string;
  last: any;
  seq: number;
}
export interface StateFile {
  byId: Record<number, MatchState>;
}

export async function loadState(): Promise<StateFile> {
  try {
    const raw = await fs.readFile(env.stateFile, 'utf8');
    return JSON.parse(raw);
  } catch {
    await fs.mkdir(path.dirname(env.stateFile), { recursive: true });
    return { byId: {} };
  }
}

export async function saveState(state: StateFile) {
  await fs.writeFile(env.stateFile, JSON.stringify(state, null, 2), 'utf8');
}
