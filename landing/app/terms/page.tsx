import { GITHUB_URL } from "../lib/site";

export const metadata = {
  title: "Terms of Service",
  description:
    "MCPBolt is MIT licensed software. Use at your own risk. No warranties expressed or implied.",
};

export default function TermsPage() {
  return (
    <>
      <header className="page-hero container">
        <div className="tag">
          <span className="tag-dot" />
          <span>MIT License</span>
        </div>
        <h1>Terms of Service</h1>
        <p className="sub">
          MCPBolt is open source software. Here is what that means legally.
        </p>
      </header>

      <div className="container" style={{ padding: "56px 24px 80px" }}>
        <div className="prose">

          <p style={{ color: "var(--fg-faint)", fontSize: "var(--fs-sm)" }}>Last updated: April 2026</p>

          <h2>The software</h2>

          <p>
            MCPBolt — including the CLI (<code>mcpbolt</code>) and the macOS menu bar app (MCPBoltBar) — is released under the <a href={`${GITHUB_URL}/blob/main/LICENSE`} target="_blank" rel="noreferrer">MIT License</a>. The full text of the license is in the repository. The short version:
          </p>

          <ul>
            <li>You can use, copy, modify, merge, publish, distribute, sublicense, and sell copies of the software.</li>
            <li>You must include the original copyright notice and license text in copies.</li>
            <li>There is no warranty, expressed or implied. The software is provided &ldquo;as is.&rdquo;</li>
          </ul>

          <h2>No warranty</h2>

          <p>
            MCPBolt reads and writes config files on your disk. While it is designed carefully (backups before every write, atomic file writes, merge-safe operations), you use it at your own risk. The authors and contributors are not responsible for data loss, broken AI tool configurations, or any other damage arising from its use.
          </p>

          <p>
            Back up your config files before trying new software. MCPBolt does this for you automatically, but belt-and-suspenders is always reasonable.
          </p>

          <h2>This website</h2>

          <p>
            The mcpbolt.com website is provided &ldquo;as is&rdquo; without any guarantee of availability, accuracy, or fitness for a particular purpose. We may update, change, or take down the site at any time without notice.
          </p>

          <h2>Contributing</h2>

          <p>
            If you submit a pull request, issue, or other contribution to the MCPBolt repository on GitHub, you agree that your contribution will be licensed under the same MIT License as the project. GitHub&apos;s standard <a href="https://docs.github.com/en/site-policy/github-terms/github-terms-of-service" target="_blank" rel="noreferrer">Terms of Service</a> apply to your use of GitHub itself.
          </p>

          <h2>Third-party services</h2>

          <p>
            This website is hosted on Vercel. By visiting the site you are also subject to <a href="https://vercel.com/legal/terms" target="_blank" rel="noreferrer">Vercel&apos;s Terms of Service</a>. The software itself does not depend on any third-party service — it runs locally on your machine.
          </p>

          <h2>Governing law</h2>

          <p>
            These terms are governed by the laws of the State of California, United States, without regard to conflict of law principles.
          </p>

          <h2>Contact</h2>

          <p>
            Questions: <a href="mailto:hello@mcpbolt.com">hello@mcpbolt.com</a>
          </p>

        </div>
      </div>
    </>
  );
}
