# Pop Open Birthday Wishes

Personalize and share an animated birthday letter.

## Run locally

Requires Node.js 22.

```sh
npm install
npm run dev
```

## Deploy on GitHub Pages

1. Make this repository public in **Settings → General → Danger Zone → Change repository visibility**. GitHub Pages requires a public repository on the free plan.
2. Open **Settings → Pages** and select **GitHub Actions** as the build and deployment source.
3. Push changes to `main`, or manually run the **Deploy to GitHub Pages** workflow from the **Actions** tab.

The workflow builds the static site and deploys it to `https://svtcodesilyy.github.io/pop-open-birthday-wishes/`. Shared letters and app navigation use hash-based URLs so they work on GitHub Pages without a server.
