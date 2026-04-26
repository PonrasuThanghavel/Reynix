import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";
import { apiCatalog, groupOrder } from "../../apiCatalog";
import "./ApiCatalog.css";

function ApiCatalog() {
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

  useEffect(() => {
    setToken(localStorage.getItem("token") ?? "");
  }, []);

  const selectedEndpoint = useMemo(
    () => apiCatalog.find((entry) => entry.id === selectedId) ?? apiCatalog[0],
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
    return apiCatalog.filter((entry) => {
      const matchesMethod = methodFilter === "ALL" || entry.method === methodFilter;
      const matchesSearch =
        !term ||
        entry.title.toLowerCase().includes(term) ||
        entry.path.toLowerCase().includes(term) ||
        entry.group.toLowerCase().includes(term) ||
        entry.description.toLowerCase().includes(term);

      return matchesMethod && matchesSearch;
    });
  }, [deferredSearch, methodFilter]);

  const endpointsByGroup = useMemo(() => {
    const grouped = new Map(groupOrder.map((group) => [group, []]));
    for (const entry of filteredEndpoints) {
      grouped.get(entry.group)?.push(entry);
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

  const sendRequest = async () => {
    const parsedHeaders = safeParseJson(headersText, {});
    const parsedQuery = safeParseJson(queryText, {});
    const parsedBody = safeParseJson(bodyText, null);

    if (!parsedHeaders.ok) {
      setRequestError(`Headers JSON is invalid: ${parsedHeaders.error}`);
      return;
    }
    if (!parsedQuery.ok) {
      setRequestError(`Query JSON is invalid: ${parsedQuery.error}`);
      return;
    }
    if (!parsedBody.ok) {
      setRequestError(`Body JSON is invalid: ${parsedBody.error}`);
      return;
    }

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
    <div className="api-catalog-page">
      <aside className="api-catalog-sidebar">
        <div className="api-catalog-sidebar-card">
          <p className="api-catalog-eyebrow">Reynix Backend</p>
          <h1>API Catalog</h1>
          <p className="api-catalog-subtle">
            Browse every backend route, prepare payloads, and inspect raw API responses from one place.
          </p>
        </div>

        <div className="api-catalog-sidebar-card api-catalog-filters">
          <label className="api-catalog-field">
            <span>Search routes</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="orders, /products, seller..."
            />
          </label>

          <label className="api-catalog-field">
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

        <div className="api-catalog-groups">
          {groupOrder.map((group) => {
            const endpoints = endpointsByGroup.get(group) ?? [];
            if (!endpoints.length) return null;

            return (
              <section key={group} className="api-catalog-sidebar-card api-catalog-group">
                <div className="api-catalog-group-heading">
                  <h2>{group}</h2>
                  <span>{endpoints.length}</span>
                </div>

                <div className="api-catalog-list">
                  {endpoints.map((entry) => (
                    <button
                      key={entry.id}
                      type="button"
                      className={`api-catalog-card ${entry.id === selectedEndpoint.id ? "active" : ""}`}
                      onClick={() => handleEndpointSelect(entry.id)}
                    >
                      <span className={`api-catalog-method api-catalog-method-${entry.method.toLowerCase()}`}>
                        {entry.method}
                      </span>
                      <strong>{entry.title}</strong>
                      <code>{entry.path}</code>
                    </button>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </aside>

      <main className="api-catalog-workspace">
        <section className="api-catalog-panel api-catalog-hero">
          <div>
            <p className="api-catalog-eyebrow">Workbench</p>
            <h2>{selectedEndpoint.title}</h2>
            <p className="api-catalog-subtle">{selectedEndpoint.description}</p>
          </div>

          <div className="api-catalog-meta">
            <span className={`api-catalog-pill api-catalog-method-${selectedEndpoint.method.toLowerCase()}`}>
              {selectedEndpoint.method}
            </span>
            <span className="api-catalog-pill api-catalog-pill-muted">{selectedEndpoint.group}</span>
            <span className="api-catalog-pill api-catalog-pill-muted">
              {selectedEndpoint.auth === "public" ? "Public" : "Protected"}
            </span>
            {selectedEndpoint.roles.length > 0 ? (
              <span className="api-catalog-pill api-catalog-pill-muted">
                Roles: {selectedEndpoint.roles.join(", ")}
              </span>
            ) : null}
          </div>
        </section>

        <section className="api-catalog-panel api-catalog-grid">
          <div className="api-catalog-stack">
            <label className="api-catalog-field">
              <span>API base URL</span>
              <input value={baseUrl} onChange={(event) => setBaseUrl(event.target.value)} />
            </label>

            <label className="api-catalog-field">
              <span>Bearer token</span>
              <textarea
                rows="3"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                placeholder="Paste JWT here or log in through the app first"
              />
            </label>

            <label className="api-catalog-field">
              <span>Resolved path</span>
              <input value={resolvedPath} readOnly />
            </label>

            {Object.keys(pathParams).length > 0 ? (
              <div className="api-catalog-subgrid">
                {Object.entries(pathParams).map(([key, value]) => (
                  <label key={key} className="api-catalog-field">
                    <span>Path param: {key}</span>
                    <input
                      value={value}
                      onChange={(event) => setPathParams((current) => ({ ...current, [key]: event.target.value }))}
                    />
                  </label>
                ))}
              </div>
            ) : null}
          </div>

          <div className="api-catalog-stack">
            <label className="api-catalog-field">
              <span>Query params JSON</span>
              <textarea
                rows="8"
                value={queryText}
                onChange={(event) => setQueryText(event.target.value)}
                placeholder="{}"
              />
            </label>

            <label className="api-catalog-field">
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

        <section className="api-catalog-panel">
          <div className="api-catalog-section-head">
            <h3>Request Body</h3>
            <div className="api-catalog-actions">
              <button
                type="button"
                className="api-catalog-button api-catalog-button-ghost"
                onClick={() => setBodyText(stringifyEditorValue(selectedEndpoint.body))}
              >
                Reset example
              </button>
              <button
                type="button"
                className="api-catalog-button api-catalog-button-ghost"
                onClick={() => setResponse(null)}
              >
                Clear response
              </button>
            </div>
          </div>

          <textarea
            className="api-catalog-editor"
            rows="14"
            value={bodyText}
            onChange={(event) => setBodyText(event.target.value)}
            placeholder="null"
          />
        </section>

        <section className="api-catalog-panel">
          <div className="api-catalog-section-head">
            <h3>Request Preview</h3>
            <button
              type="button"
              className="api-catalog-button api-catalog-button-primary"
              onClick={sendRequest}
              disabled={isSending}
            >
              {isSending ? "Sending..." : "Send Request"}
            </button>
          </div>

          <div className="api-catalog-preview">
            <div className="api-catalog-preview-line">
              <span className={`api-catalog-pill api-catalog-method-${selectedEndpoint.method.toLowerCase()}`}>
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

          {requestError ? <p className="api-catalog-error">{requestError}</p> : null}
        </section>

        <section className="api-catalog-panel">
          <div className="api-catalog-section-head">
            <h3>Response</h3>
            {response ? (
              <div className="api-catalog-response-meta">
                <span className={response.ok ? "api-catalog-ok" : "api-catalog-error-pill"}>
                  {response.status} {response.statusText}
                </span>
                <span>{response.durationMs} ms</span>
              </div>
            ) : (
              <span className="api-catalog-subtle">No response yet</span>
            )}
          </div>

          {response ? (
            <div className="api-catalog-response-grid">
              <div>
                <h4>Body</h4>
                <pre className="api-catalog-block">
                  {response.data ? JSON.stringify(response.data, null, 2) : response.rawText || "(empty body)"}
                </pre>
              </div>
              <div>
                <h4>Headers</h4>
                <pre className="api-catalog-block">{JSON.stringify(response.headers, null, 2)}</pre>
              </div>
            </div>
          ) : (
            <div className="api-catalog-empty">
              Choose an endpoint, tweak params or JSON, then send a request to inspect the backend response here.
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

export default ApiCatalog;
