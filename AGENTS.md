<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Sound effects are synthesized with the Web Audio API in src/lib/sounds.ts (no audio files), so they work offline and need no assets.
- AI birthday-message generation streams plain text from the server route /api/generate-message (src/lib/ai/*.server.ts) so the API key and prompt stay server-side and text appears live in the editor.
