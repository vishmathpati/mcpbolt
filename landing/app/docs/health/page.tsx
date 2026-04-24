import Link from "next/link";
import { Callout } from "../../components/Callout";
import { DocsPageNav } from "../DocsPageNav";

export const metadata = {
  title: "Health status",
  description:
    "How MCPBoltBar's always-on health monitoring works — what green, amber, and red mean, how checks are performed, and how to interpret failures.",
};

export default function DocsHealthPage() {
  return (
    <>
      <div className="prose">
        <h1>Always-on health status</h1>
        <p>
          MCPBoltBar checks the health of every registered MCP server once per minute and displays
          a colored dot next to each server. You don't need to trigger a check manually — the status
          is always current.
        </p>

        <hr />

        <h2>What the colors mean</h2>
        <table>
          <thead>
            <tr>
              <th>Color</th>
              <th>Status</th>
              <th>Meaning</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Green</td>
              <td>Reachable</td>
              <td>The server responded successfully to the last health check.</td>
            </tr>
            <tr>
              <td>Amber</td>
              <td>Degraded</td>
              <td>
                The server responded but with a non-success status, or the response was slow (above
                the timeout threshold). The server is running but may not be fully functional.
              </td>
            </tr>
            <tr>
              <td>Red</td>
              <td>Unreachable</td>
              <td>
                The server did not respond — connection refused, timeout, command not found, or the
                process exited immediately.
              </td>
            </tr>
            <tr>
              <td>Grey</td>
              <td>Not checked</td>
              <td>
                The server is disabled (toggled off) or MCPBoltBar has not run a check yet since
                launch.
              </td>
            </tr>
          </tbody>
        </table>

        <hr />

        <h2>How checks are performed</h2>
        <p>MCPBolt uses different strategies depending on the server's transport type:</p>

        <h3>Remote servers (HTTP / SSE)</h3>
        <p>
          For servers with a <code>url</code> field, MCPBolt sends an HTTP <code>GET</code> to the
          server's URL (or a <code>/health</code> endpoint if one is available). A 2xx response
          means green. A 4xx/5xx or a connection error means red. A slow response (default timeout:
          5 seconds) means amber.
        </p>
        <p>
          If the URL requires an Authorization header (as specified in the config's{" "}
          <code>headers</code> field), MCPBolt includes it in the health check request.
        </p>

        <h3>Local servers (stdio)</h3>
        <p>
          For servers launched via <code>command</code> + <code>args</code>, MCPBolt spawns the
          process, sends the MCP initialization handshake, waits for a valid response, then
          terminates the process. A successful handshake means green. A non-zero exit code, a
          missing binary, or a timeout means red.
        </p>
        <p>
          This means health checks briefly spawn local stdio servers. The spawn is kept short —
          MCPBolt exits after the handshake, not after a full session.
        </p>

        <Callout kind="info" title="Resource impact">
          Spawning a stdio server once per minute is lightweight for most servers. If a server is
          slow to start (e.g. a large Python package), it may occasionally appear amber due to
          the timeout. You can increase the timeout in Settings.
        </Callout>

        <hr />

        <h2>Check interval</h2>
        <p>
          Health checks run every 60 seconds while MCPBoltBar is running. There is no way to
          disable health checks globally, but disabling a server (toggling it off) stops checks
          for that server.
        </p>

        <hr />

        <h2>Interpreting failures</h2>

        <h3>Red — command not installed</h3>
        <p>
          The most common cause of red on a stdio server is that the command isn't on your{" "}
          <code>PATH</code>. For example, if the server uses <code>python3</code> and Python isn't
          installed, the spawn fails immediately. Install the dependency and the server will turn
          green on the next check.
        </p>

        <h3>Red — network blocked</h3>
        <p>
          Remote servers show red if they can't be reached — VPN down, firewall rule, or the
          service itself is offline. Check connectivity in a browser or with <code>curl</code>
          before assuming the server config is wrong.
        </p>

        <h3>Red — wrong URL</h3>
        <p>
          If you configured a remote server with an incorrect URL, health checks will always fail.
          Use the Edit action to correct the URL.
        </p>

        <h3>Amber — slow start</h3>
        <p>
          Amber often means the server started successfully but took longer than expected. This
          is common for servers that download dependencies at startup (e.g. <code>npx -y</code>{" "}
          packages on first run). After the first run, subsequent checks are usually green.
        </p>

        <Callout kind="tip" title="Manual re-check">
          To force an immediate re-check without waiting for the 60-second interval, click the
          health dot on any server row. MCPBolt runs a single check and updates the status in place.
        </Callout>
      </div>
      <DocsPageNav
        prev={{ label: "Projects tab", href: "/docs/projects" }}
        next={{ label: "Supported apps", href: "/docs/apps" }}
      />
    </>
  );
}
