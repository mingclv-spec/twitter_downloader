import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';

type ArchivePayload = {
  tweetId?: unknown;
  sourceUrl?: unknown;
  title?: unknown;
  text?: unknown;
  author?: { name?: unknown; screenName?: unknown };
  createdAt?: unknown;
  videoUrl?: unknown;
  targetLanguage?: unknown;
  translation?: unknown;
};

const textValue = (value: unknown, max = 20000): string =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

export function createArchiveRouter(projectDir: string) {
  const router = Router();
  const archiveDir = path.resolve(process.env.ARCHIVE_DIR || path.join(projectDir, 'data'));
  fs.mkdirSync(archiveDir, { recursive: true });

  const db = new DatabaseSync(path.join(archiveDir, 'xtrans-archive.sqlite'));
  db.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS posts (
      tweet_id TEXT PRIMARY KEY,
      source_url TEXT NOT NULL DEFAULT '',
      title TEXT NOT NULL DEFAULT '',
      post_text TEXT NOT NULL DEFAULT '',
      author_name TEXT NOT NULL DEFAULT '',
      author_handle TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT '',
      video_url TEXT NOT NULL DEFAULT '',
      target_language TEXT NOT NULL DEFAULT '',
      translation_json TEXT,
      saved_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_posts_saved_at ON posts(saved_at DESC);
  `);

  const listPosts = db.prepare(`
    SELECT tweet_id AS tweetId, source_url AS sourceUrl, title,
      post_text AS text, author_name AS authorName, author_handle AS authorHandle,
      created_at AS createdAt, video_url AS videoUrl,
      target_language AS targetLanguage, translation_json AS translationJson,
      saved_at AS savedAt
    FROM posts ORDER BY saved_at DESC LIMIT ?
  `);
  const getPost = db.prepare(`
    SELECT tweet_id AS tweetId, source_url AS sourceUrl, title,
      post_text AS text, author_name AS authorName, author_handle AS authorHandle,
      created_at AS createdAt, video_url AS videoUrl,
      target_language AS targetLanguage, translation_json AS translationJson,
      saved_at AS savedAt
    FROM posts WHERE tweet_id = ?
  `);

  const serialize = (row: any) => {
    if (!row) return null;
    let translation = null;
    if (row.translationJson) {
      try { translation = JSON.parse(row.translationJson); } catch { translation = null; }
    }
    const { translationJson, ...post } = row;
    return { ...post, translation };
  };

  router.get('/', (_req: Request, res: Response) => {
    const requested = Number(_req.query.limit) || 50;
    const limit = Math.min(200, Math.max(1, requested));
    res.json({ success: true, posts: (listPosts.all(limit) as any[]).map(serialize) });
  });

  router.get('/:tweetId', (req: Request, res: Response) => {
    const row = getPost.get(textValue(req.params.tweetId, 128));
    if (!row) return res.status(404).json({ success: false, error: 'Archive record not found.' });
    res.json({ success: true, post: serialize(row) });
  });

  router.post('/', (req: Request, res: Response) => {
    const body = req.body as ArchivePayload;
    const tweetId = textValue(body.tweetId, 128);
    if (!tweetId || !/^[a-zA-Z0-9_-]+$/.test(tweetId)) {
      return res.status(400).json({ success: false, error: 'A valid post ID is required.' });
    }

    let translationJson: string | null = null;
    if (body.translation !== undefined && body.translation !== null) {
      try { translationJson = JSON.stringify(body.translation); }
      catch { return res.status(400).json({ success: false, error: 'Translation data must be valid JSON.' }); }
      if (translationJson.length > 2_000_000) {
        return res.status(413).json({ success: false, error: 'Translation data is too large.' });
      }
    }

    const existed = Boolean(getPost.get(tweetId));

    db.prepare(`
      INSERT INTO posts (
        tweet_id, source_url, title, post_text, author_name, author_handle,
        created_at, video_url, target_language, translation_json, saved_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(tweet_id) DO UPDATE SET
        source_url=excluded.source_url, title=excluded.title,
        post_text=excluded.post_text, author_name=excluded.author_name,
        author_handle=excluded.author_handle, created_at=excluded.created_at,
        video_url=excluded.video_url,
        target_language=CASE WHEN excluded.target_language <> '' THEN excluded.target_language ELSE posts.target_language END,
        translation_json=COALESCE(excluded.translation_json, posts.translation_json),
        saved_at=CURRENT_TIMESTAMP
    `).run(
      tweetId,
      textValue(body.sourceUrl, 4096),
      textValue(body.title, 1000),
      textValue(body.text),
      textValue(body.author?.name, 300),
      textValue(body.author?.screenName, 100),
      textValue(body.createdAt, 100),
      textValue(body.videoUrl, 4096),
      textValue(body.targetLanguage, 20),
      translationJson,
    );

    res.json({ success: true, tweetId, duplicate: existed });
  });

  router.delete('/:tweetId', (req: Request, res: Response) => {
    const result = db.prepare('DELETE FROM posts WHERE tweet_id = ?').run(textValue(req.params.tweetId, 128));
    if (Number(result.changes) === 0) return res.status(404).json({ success: false, error: 'Archive record not found.' });
    res.json({ success: true });
  });

  return router;
}
