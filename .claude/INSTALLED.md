# Workspace tooling — what's installed & what you still need to do

Set up on 2026-06-24 for the "velion site test" workspace. Node.js (v26, via Homebrew) was
installed so the MCP servers can run via `npx`.

---

## ✅ Skills installed directly (in `.claude/skills/`)

These are live now — Claude auto-discovers them this session. Grouped by what you asked for:

| Your request | Folder | Source |
|---|---|---|
| UI/UX Pro Max | `ui-ux-pro-max` | nextlevelbuilder/ui-ux-pro-max-skill |
| taste skill | `taste` | Leonxlnx/taste-skill |
| Emil Kowalski Design skill | `emil-design-eng` (+ `emil-review-animations`) | emilkowalski/skills |
| Web Design Guidelines | `web-design-guidelines` | vercel-labs/agent-skills |
| Brand Kit skill | `brand-kit` | Leonxlnx/taste-skill (brandkit) |
| shadcn/ui | `shadcn-ui` | masonjames/shadcnblocks-skill (1,338 blocks + 1,189 components) |
| Vercel react best practices | `vercel-react-best-practices` | vercel-labs/agent-skills |
| framer motion | `framer-motion` | freshtechbro/claudedesignskills (motion-framer) |
| GSAP | `gsap` | freshtechbro/claudedesignskills (gsap-scrolltrigger) |
| Lenis | `lenis` | authored here (no clean published skill existed) |
| Magic UI + Aceternity UI | `animated-component-libraries` | freshtechbro/claudedesignskills (covers shadcn/Magic UI/Aceternity selection) |
| SEO skill | `seo` | aevans-eng/seo-skill |
| Next.js SEO skill | `nextjs-seo` | kumbajirajkumar123/nextjs-seo-optimizer |
| Lighthouse | `lighthouse-audit`, `core-web-vitals`, `performance` | addyosmani/web-quality-skills |

> Note on component libraries: **shadcn/ui**, **Magic UI**, and **Aceternity UI** are component
> *registries*, not really "skills." The `shadcn-ui` and `animated-component-libraries` skills teach
> Claude to pick + install the right pieces. The actual components are added per-project with the
> shadcn CLI once the Next.js app exists, e.g.:
> ```
> npx shadcn@latest init
> npx shadcn@latest add button card            # shadcn/ui
> npx shadcn@latest add "https://magicui.design/r/marquee"      # Magic UI registry
> npx shadcn@latest add "https://ui.aceternity.com/registry/..."  # Aceternity registry
> ```

---

## ✅ MCP servers configured (`.mcp.json`)

1. **Chrome DevTools MCP** (`chrome-devtools-mcp`) — works as-is. Restart Claude Code so it loads;
   approve the server when prompted.
2. **Magic MCP (21st.dev)** (`@21st-dev/magic`) — ⚠️ **needs your API key.**
   - Get a key at https://21st.dev/magic/console
   - Open `.mcp.json` and replace `REPLACE_WITH_YOUR_21ST_DEV_API_KEY` with it.
   - Until then this server will fail to start (the Chrome one is unaffected).

After editing, restart Claude Code (or run `/mcp` to check status) and approve both servers.

---

## ▶️ Run these yourself — official/marketplace plugins (need the interactive `/plugin` panel)

I can't drive the `/plugin` UI from an automated session and there's no `claude` CLI on PATH here,
so paste these into Claude Code (interactive). They install the remaining items as managed plugins
that auto-update:

```
# Superpowers (full agentic workflow methodology)
/plugin marketplace add obra/superpowers-marketplace
/plugin install superpowers@superpowers-marketplace

# Anthropic official plugins (marketplace is built in)
/plugin install frontend-design@claude-plugins-official     # "frontend design skill"
/plugin install code-review@claude-plugins-official         # "Code Review Skill"
/plugin install commit-commands@claude-plugins-official     # "Git Workflow Skill" (git commit/PR helpers)
```

> `/code-review`, `/review`, and `/security-review` are **already available** in Claude Code without
> any install — the `code-review@claude-plugins-official` plugin just adds the multi-agent PR toolkit
> on top.

---

## Optional: shadcn registry MCP

If you'd rather have shadcn component installation driven by an MCP (instead of just the skill), add:
```
npx shadcn@latest mcp init --client claude
```
(run inside the project after it's scaffolded).
