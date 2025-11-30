"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner, EmptyState } from "@/components/ui/loading-states";
import { Key, Copy, Trash2, Plus, CheckCircle } from "lucide-react";

interface ApiToken {
  token_id: string;
  name: string;
  token?: string;
  created_at: string;
  expires_at: string;
  last_used_at: string | null;
  is_active: boolean;
}

export default function ApiTokensPage() {
  const [tokens, setTokens] = useState<ApiToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTokenName, setNewTokenName] = useState("");
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    try {
      setLoading(true);
      setError(null);

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";
      const apiKey = process.env.NEXT_PUBLIC_API_KEY || "change-me";

      const response = await fetch(`${baseUrl}/tokens`, {
        headers: {
          "X-API-Key": apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      setTokens(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tokens");
    } finally {
      setLoading(false);
    }
  };

  const createToken = async () => {
    if (!newTokenName.trim()) {
      alert("Please enter a token name");
      return;
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";
      const apiKey = process.env.NEXT_PUBLIC_API_KEY || "change-me";

      const response = await fetch(`${baseUrl}/tokens`, {
        method: "POST",
        headers: {
          "X-API-Key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newTokenName,
          expires_days: 365,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create token: ${response.status}`);
      }

      const result = await response.json();
      setCreatedToken(result.token);
      setNewTokenName("");
      await fetchTokens();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create token");
    }
  };

  const revokeToken = async (tokenId: string) => {
    if (!confirm("Are you sure you want to revoke this token? This action cannot be undone.")) {
      return;
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";
      const apiKey = process.env.NEXT_PUBLIC_API_KEY || "change-me";

      const response = await fetch(`${baseUrl}/tokens/${tokenId}`, {
        method: "DELETE",
        headers: {
          "X-API-Key": apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to revoke token: ${response.status}`);
      }

      await fetchTokens();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to revoke token");
    }
  };

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">API Tokens</h1>
        <p className="text-neutral-600 mt-2">
          Manage API tokens for external access to forecast data
        </p>
      </div>

      {/* Create New Token */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Create New Token</h2>
        <div className="flex gap-4">
          <input
            type="text"
            value={newTokenName}
            onChange={(e) => setNewTokenName(e.target.value)}
            placeholder="Token name (e.g., Power BI Integration)"
            className="flex-1 px-4 py-2 border rounded-md"
          />
          <Button onClick={createToken} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Generate Token
          </Button>
        </div>
      </Card>

      {/* New Token Display */}
      {createdToken && (
        <Card className="p-6 bg-green-50 border-green-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                Token Created Successfully!
              </h3>
              <p className="text-sm text-green-800 mb-4">
                Copy this token now. You won't be able to see it again!
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-3 bg-white border border-green-300 rounded font-mono text-sm">
                  {createdToken}
                </code>
                <Button
                  onClick={() => copyToken(createdToken)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>
            <button
              onClick={() => setCreatedToken(null)}
              className="text-green-600 hover:text-green-800"
            >
              ✕
            </button>
          </div>
        </Card>
      )}

      {/* Tokens List */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Active Tokens</h2>
        {tokens.length === 0 ? (
          <EmptyState
            title="No API tokens"
            description="Create a token to enable external access to forecast data."
            icon={<Key className="h-12 w-12" />}
          />
        ) : (
          <div className="space-y-4">
            {tokens.map((token) => (
              <div
                key={token.token_id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-neutral-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Key className="h-5 w-5 text-neutral-600" />
                    <h3 className="font-semibold">{token.name}</h3>
                    {token.is_active ? (
                      <Badge className="bg-green-500">Active</Badge>
                    ) : (
                      <Badge className="bg-gray-500">Revoked</Badge>
                    )}
                  </div>
                  <div className="text-sm text-neutral-600 space-y-1">
                    <p>Created: {formatDate(token.created_at)}</p>
                    <p>Expires: {formatDate(token.expires_at)}</p>
                    {token.last_used_at && <p>Last used: {formatDate(token.last_used_at)}</p>}
                  </div>
                </div>
                {token.is_active && (
                  <Button
                    onClick={() => revokeToken(token.token_id)}
                    variant="destructive"
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Revoke
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Usage Instructions */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Using API Tokens</h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p><strong>For Power BI / Tableau:</strong></p>
          <ol className="list-decimal list-inside space-y-1 ml-4">
            <li>Create a new token with a descriptive name</li>
            <li>Copy the token immediately (it won't be shown again)</li>
            <li>Use the token in the X-API-Key header when making requests</li>
            <li>Access forecast data via /api/forecast endpoints</li>
          </ol>
          <p className="mt-4"><strong>Example API Endpoints:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>GET /api/forecast/plan?horizon=1</li>
            <li>GET /api/forecast/runs/latest</li>
            <li>GET /api/categories/forecast?horizon=1</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
