import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";
import "./App.css";
import { apiCatalog, groupOrder } from "./apiCatalog";

function App() {
  const [baseUrl, setBaseUrl] = useState("http://localhost:5000/api");
  const [token, setToken] = useState("");
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("ALL");
  const [selectedId, setSelectedId] = useState(apiCatalog[0].id);
  const [pathParams, setPathParams] = useState(apiCatalog[0].pathParams);
  const [queryText, setQueryText] = useState(stringifyEditorValue(apiCatalog[0].query));
  const [bodyText, setBodyText] = useState(stringifyEditorValue(apiCatalog[0].body));
  const [headersText, setHeadersText] = useState('{\n  "Content-Type": "application/json"\n}');
  const [response, setResponse] = useState(null);
  const [requestError, setRequestError] = useState("");
  const [isSending, setIsSending] = useState(false);
  const deferredSearch = useDeferredValue(search);

  const selectedEndpoint = useMemo(
    () => apiCatalog.find((endpoint) => endpoint.id === selectedId) ?? apiCatalog[0],
    [selectedId]
  );

  useEffect(() => {
    setPathParams(selectedEndpoint.pathParams);
    setQueryText(stringifyEditorValue(selectedEndpoint.query));
    setBodyText(stringifyEditorValue(selectedEndpoint.body));
    setRequestError("");
  }, [selectedEndpoint]);

  const filteredEndpoints = useMemo(() => {
    const term = deferredSearch.trim().toLowerCase();
    return apiCatalog.filter((endpoint) => {
      const matchesMethod = methodFilter === "ALL" || endpoint.method === methodFilter;
      const matchesSearch =
        !term ||
        endpoint.title.toLowerCase().includes(term) ||
        endpoint.path.toLowerCase().includes(term) ||
        endpoint.group.toLowerCase().includes(term) ||
        endpoint.description.toLowerCase().includes(term);

      return matchesMethod && matchesSearch;
    });
  }, [deferredSearch, methodFilter]);

  const endpointsByGroup = useMemo(() => {
    const grouped = new Map(groupOrder.map((group) => [group, []]));
    for (const endpoint of filteredEndpoints) {
      grouped.get(endpoint.group)?.push(endpoint);
    }
    return grouped;
  }, [filteredEndpoints]);

  const resolvedPath = useMemo(
    () => hydratePath(selectedEndpoint.path, pathParams),
    [selectedEndpoint.path, pathParams]
  );

  const queryPreview = useMemo(() => {
    const parsed = safeParseJson(queryText, {});
    return parsed.ok ? buildQueryString(parsed.value) : "";
  }, [queryText]);

  const curlPreview = useMemo(() => {
    const parsedHeaders = safeParseJson(headersText, {});
    const parsedBody = safeParseJson(bodyText, null);
    const headerLines = [];

    if (token.trim()) {
      headerLines.push(`-H "Authorization: Bearer ${token.trim()}"`);
    }

    if (parsedHeaders.ok) {
      for (const [key, value] of Object.entries(parsedHeaders.value ?? {})) {
        if (key.toLowerCase() === "authorization" && token.trim()) continue;
        headerLines.push(`-H "${key}: ${String(value)}"`);
      }
    }

    const bodyLine =
      shouldSendBody(selectedEndpoint.method) && parsedBody.ok && parsedBody.value !== null
        ? ` \\\n  --data '${JSON.stringify(parsedBody.value)}'`
        : "";

    const querySegment = queryPreview ? `?${queryPreview}` : "";
    return `curl -X ${selectedEndpoint.method} "${baseUrl}${resolvedPath}${querySegment}"${
      headerLines.length ? ` \\\n  ${headerLines.join(" \\\n  ")}` : ""
    }${bodyLine}`;
  }, [baseUrl, bodyText, headersText, queryPreview, resolvedPath, selectedEndpoint.method, token]);

  const handleEndpointSelect = (id) => {
    startTransition(() => {
      setSelectedId(id);
      setResponse(null);
    });
  };

  const handlePathParamChange = (key, value) => {
    setPathParams((current) => ({ ...current, [key]: value }));
  };

  const sendRequest = async () => {
    const parsedHeaders = safeParseJson(headersText, {});
    const parsedQuery = safeParseJson(queryText, {});
    const parsedBody = safeParseJson(bodyText, null);

    if (!parsedHeaders.ok) return setRequestError(`Headers JSON is invalid: ${parsedHeaders.error}`);
    if (!parsedQuery.ok) return setRequestError(`Query JSON is invalid: ${parsedQuery.error}`);
    if (!parsedBody.ok) return setRequestError(`Body JSON is invalid: ${parsedBody.error}`);

    const headers = { ...(parsedHeaders.value ?? {}) };
    if (token.trim()) {
      headers.Authorization = `Bearer ${token.trim()}`;
    }

    const queryString = buildQueryString(parsedQuery.value);
    const requestUrl = `${baseUrl}${resolvedPath}${queryString ? `?${queryString}` : ""}`;
    const options = {
      method: selectedEndpoint.method,
      headers,
    };

    if (shouldSendBody(selectedEndpoint.method) && parsedBody.value !== null) {
      options.body = JSON.stringify(parsedBody.value);
    }

    setIsSending(true);
    setRequestError("");
    setResponse(null);

    const startedAt = performance.now();

    try {
      const res = await fetch(requestUrl, options);
      const rawText = await res.text();
      const durationMs = Math.round(performance.now() - startedAt);
      const data = tryParseJson(rawText);
      const responseHeaders = Object.fromEntries(res.headers.entries());

      setResponse({
        ok: res.ok,
        status: res.status,
        statusText: res.statusText,
        durationMs,
        headers: responseHeaders,
        rawText,
        data,
      });

      const maybeToken = data?.data?.token ?? data?.token ?? null;
      if (typeof maybeToken === "string" && maybeToken.trim()) {
        setToken(maybeToken);
      }
    } catch (error) {
      setRequestError(error.message || "Request failed");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-header">
          <p className="eyebrow">Reynix Backend</p>
          <h1>API Dashboard</h1>
          <p className="subtle">
            Browse every backend route, send requests, and inspect JSON responses without leaving the
            page.
          </p>
        </div>

        <div className="sidebar-controls">
          <label className="field">
            <span>Search routes</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="orders, /products, seller..."
            />
          </label>

          <label className="field">
            <span>Method filter</span>
            <select value={methodFilter} onChange={(event) => setMethodFilter(event.target.value)}>
              <option value="ALL">All methods</option>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
          </label>
        </div>

        <div className="endpoint-groups">
          {groupOrder.map((group) => {
            const endpoints = endpointsByGroup.get(group) ?? [];
            if (!endpoints.length) return null;

            return (
              <section key={group} className="endpoint-group">
                <div className="group-heading">
                  <h2>{group}</h2>
                  <span>{endpoints.length}</span>
                </div>

                <div className="endpoint-list">
                  {endpoints.map((endpoint) => (
                    <button
                      key={endpoint.id}
                      type="button"
                      className={`endpoint-card ${endpoint.id === selectedEndpoint.id ? "active" : ""}`}
                      onClick={() => handleEndpointSelect(endpoint.id)}
                    >
                      <span className={`method method-${endpoint.method.toLowerCase()}`}>{endpoint.method}</span>
                      <strong>{endpoint.title}</strong>
                      <code>{endpoint.path}</code>
                    </button>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </aside>

      <main className="workspace">
        <section className="panel hero-panel">
          <div className="hero-copy">
            <p className="eyebrow">Workbench</p>
            <h2>{selectedEndpoint.title}</h2>
            <p>{selectedEndpoint.description}</p>
          </div>

          <div className="endpoint-meta">
            <span className={`method-pill method-${selectedEndpoint.method.toLowerCase()}`}>
              {selectedEndpoint.method}
            </span>
            <span className="meta-pill">{selectedEndpoint.group}</span>
            <span className="meta-pill">{selectedEndpoint.auth === "public" ? "Public" : "Protected"}</span>
            {selectedEndpoint.roles.length > 0 ? (
              <span className="meta-pill">Roles: {selectedEndpoint.roles.join(", ")}</span>
            ) : null}
          </div>
        </section>

        <section className="panel grid-panel">
          <div className="stack">
            <label className="field">
              <span>API base URL</span>
              <input value={baseUrl} onChange={(event) => setBaseUrl(event.target.value)} />
            </label>

            <label className="field">
              <span>Bearer token</span>
              <textarea
                rows="3"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                placeholder="Paste JWT here or auto-fill it by calling register/login"
              />
            </label>

            <label className="field">
              <span>Resolved path</span>
              <input value={resolvedPath} readOnly />
            </label>

            {Object.keys(pathParams).length > 0 ? (
              <div className="subgrid">
                {Object.entries(pathParams).map(([key, value]) => (
                  <label key={key} className="field">
                    <span>Path param: {key}</span>
                    <input value={value} onChange={(event) => handlePathParamChange(key, event.target.value)} />
                  </label>
                ))}
              </div>
            ) : null}
          </div>

          <div className="stack">
            <label className="field">
              <span>Query params JSON</span>
              <textarea
                rows="8"
                value={queryText}
                onChange={(event) => setQueryText(event.target.value)}
                placeholder="{}"
              />
            </label>

            <label className="field">
              <span>Headers JSON</span>
              <textarea
                rows="8"
                value={headersText}
                onChange={(event) => setHeadersText(event.target.value)}
                placeholder='{"Content-Type":"application/json"}'
              />
            </label>
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <h3>Request Body</h3>
            <div className="actions">
              <button type="button" className="ghost-button" onClick={() => setBodyText(stringifyEditorValue(selectedEndpoint.body))}>
                Reset example
              </button>
              <button type="button" className="ghost-button" onClick={() => setResponse(null)}>
                Clear response
              </button>
            </div>
          </div>

          <textarea
            className="editor"
            rows="14"
            value={bodyText}
            onChange={(event) => setBodyText(event.target.value)}
            placeholder="null"
          />
        </section>

        <section className="panel">
          <div className="panel-heading">
            <h3>Request Preview</h3>
            <button type="button" className="primary-button" onClick={sendRequest} disabled={isSending}>
              {isSending ? "Sending..." : "Send Request"}
            </button>
          </div>

          <div className="request-preview">
            <div className="request-line">
              <span className={`method-pill method-${selectedEndpoint.method.toLowerCase()}`}>
                {selectedEndpoint.method}
              </span>
              <code>
                {baseUrl}
                {resolvedPath}
                {queryPreview ? `?${queryPreview}` : ""}
              </code>
            </div>
            <pre>{curlPreview}</pre>
          </div>

          {requestError ? <p className="error-text">{requestError}</p> : null}
        </section>

        <section className="panel response-panel">
          <div className="panel-heading">
            <h3>Response</h3>
            {response ? (
              <div className="response-meta">
                <span className={response.ok ? "status-ok" : "status-error"}>
                  {response.status} {response.statusText}
                </span>
                <span>{response.durationMs} ms</span>
              </div>
            ) : (
              <span className="subtle">No response yet</span>
            )}
          </div>

          {response ? (
            <div className="response-grid">
              <div>
                <h4>Body</h4>
                <pre className="response-block">
                  {response.data ? JSON.stringify(response.data, null, 2) : response.rawText || "(empty body)"}
                </pre>
              </div>
              <div>
                <h4>Headers</h4>
                <pre className="response-block">{JSON.stringify(response.headers, null, 2)}</pre>
              </div>
            </div>
          ) : (
            <div className="response-empty">
              Pick an endpoint, adjust params or JSON, and send a request to see the full payload here.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function stringifyEditorValue(value) {
  if (value === null) return "null";
  if (value === undefined) return "{}";
  return JSON.stringify(value, null, 2);
}

function hydratePath(path, params) {
  return path.replace(/:([A-Za-z0-9_]+)/g, (_, key) => encodeURIComponent(params[key] ?? `:${key}`));
}

function safeParseJson(input, fallback) {
  const trimmed = input.trim();
  if (!trimmed) return { ok: true, value: fallback };

  try {
    return { ok: true, value: JSON.parse(trimmed) };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

function tryParseJson(input) {
  if (!input) return null;
  try {
    return JSON.parse(input);
  } catch {
    return null;
  }
}

function shouldSendBody(method) {
  return !["GET", "HEAD"].includes(method);
}

function buildQueryString(query) {
  if (!query || typeof query !== "object") return "";

  const params = new URLSearchParams();
  for (const [key, rawValue] of Object.entries(query)) {
    if (rawValue === "" || rawValue === null || rawValue === undefined) continue;

    if (Array.isArray(rawValue)) {
      for (const item of rawValue) {
        params.append(key, String(item));
      }
      continue;
    }

    params.append(key, String(rawValue));
  }

  return params.toString();
}

export default App;
