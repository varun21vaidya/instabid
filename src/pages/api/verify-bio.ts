import type { APIRoute } from 'astro';
import { generateChallengeCode, checkBioChallenge } from '@/lib/verification';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { action, handle, challengeCode } = body;

    if (action === 'generate') {
      if (!handle) {
        return new Response(JSON.stringify({ error: 'Instagram handle is required.' }), { status: 400 });
      }
      const code = generateChallengeCode();
      return new Response(
        JSON.stringify({
          success: true,
          handle: handle.replace('@', '').toLowerCase(),
          challengeCode: code,
          instructions: `Paste the code "${code}" anywhere into your Instagram profile bio, save it, then click "Verify My Bio".`,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'verify') {
      if (!handle || !challengeCode) {
        return new Response(JSON.stringify({ error: 'Handle and challenge code are required.' }), { status: 400 });
      }

      const result = await checkBioChallenge(handle, challengeCode);
      return new Response(JSON.stringify(result), {
        status: result.success ? 200 : 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action.' }), { status: 400 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Server error' }), { status: 500 });
  }
};
