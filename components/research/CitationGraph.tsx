"use client";
import { useEffect, useRef, useState } from "react";
import { Network } from "lucide-react";
import toast from "react-hot-toast";

interface Node { id: string; label: string; year: string; court: string; group: string }
interface Edge { from: string; to: string; label?: string }

export default function CitationGraphClient() {
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef   = useRef<any>(null);
  const [query, setQuery]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [selected, setSelected] = useState<Node | null>(null);
  const [nodes, setNodes]       = useState<Node[]>([]);

  async function fetchGraph(q: string) {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const r = await fetch("/api/citations", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ query: q }),
      });
      if (!r.ok) throw new Error();
      const { nodes: n, edges: e } = await r.json();
      setNodes(n);
      renderGraph(n, e);
    } catch {
      toast.error("Failed to load citation graph");
    } finally {
      setLoading(false);
    }
  }

  function renderGraph(n: Node[], e: Edge[]) {
    if (!containerRef.current) return;
    import("vis-network/standalone").then(({ Network: VisNetwork, DataSet }) => {
      networkRef.current?.destroy();
      const nodeData = new DataSet(n.map(node => ({
        id:    node.id,
        label: node.label.length > 25 ? node.label.slice(0, 25) + "…" : node.label,
        title: `${node.label}\n${node.court} (${node.year})`,
        color: {
          background: node.group === "landmark" ? "#C9A84C" : node.group === "recent" ? "#0C7B7A" : "#1E3A5F",
          border:     node.group === "landmark" ? "#B8912B" : "#2A4F7A",
          highlight:  { background: "#2563EB", border: "#1D4ED8" },
        },
        font:  { color: "#EEF2F7", size: 12 },
        shape: node.group === "landmark" ? "diamond" : "dot",
        size:  node.group === "landmark" ? 20 : 14,
      })));
      const edgeData = new DataSet(e.map((edge: any) => ({
        id:    `${edge.from}-${edge.to}`,
        from:  edge.from,
        to:    edge.to,
        label: edge.label ?? "",
        color: { color: "rgba(255,255,255,0.15)", highlight: "#C9A84C" },
        font:  { color: "#7A8FA6", size: 10 },
        arrows: { to: { enabled: true, scaleFactor: 0.5 } },
        smooth: { enabled: true, type: "curvedCW", roundness: 0.2 },
      })) as any);
      const net = new VisNetwork(
        containerRef.current!,
        { nodes: nodeData, edges: edgeData as any },
        {
          physics: { enabled: true, solver: "forceAtlas2Based", stabilization: { iterations: 100 } },
          interaction: { hover: true, navigationButtons: false, keyboard: true },
        }
      );
      net.on("click", (params: any) => {
        if (params.nodes.length > 0) {
          const id = params.nodes[0];
          setSelected(n.find(nd => nd.id === id) ?? null);
        } else {
          setSelected(null);
        }
      });
      networkRef.current = net;
    });
  }

  return (
    <div className="p-6 max-w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          🕸️ Citation Network
        </h1>
        <p className="text-[#7A8FA6] text-sm mt-1">Interactive graph of case law precedents and citations</p>
      </div>

      <div className="flex gap-3 mb-6">
        <input
          value={query} onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === "Enter" && fetchGraph(query)}
          placeholder="Search case name or legal topic…"
          className="input-field flex-1"
        />
        <button onClick={() => fetchGraph(query)} disabled={loading || !query.trim()} className="btn-primary shrink-0">
          {loading ? "Loading…" : "Build graph"}
        </button>
      </div>

      {/* Graph container */}
      <div className="card p-0 overflow-hidden" style={{ height: "60vh", position: "relative" }}>
        {nodes.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-5xl mb-4">🕸️</div>
            <p className="text-[#7A8FA6]">Search for a case or topic above to build the citation network</p>
            <div className="flex flex-wrap gap-2 mt-4 justify-center max-w-sm">
              {["Unfair dismissal", "Race discrimination", "Human rights Article 6", "Negligence duty of care"].map(s => (
                <button key={s} onClick={() => { setQuery(s); fetchGraph(s); }}
                  className="text-xs px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-full text-[#7A8FA6]">
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-4xl animate-pulse mb-3">🕸️</div>
              <p className="text-[#7A8FA6]">Building citation network…</p>
            </div>
          </div>
        ) : null}
        <div ref={containerRef} id="citation-graph" style={{ width: "100%", height: "100%", display: nodes.length > 0 ? "block" : "none" }} />
      </div>

      {/* Selected node info */}
      {selected && (
        <div className="card mt-4 border-[#C9A84C]/20">
          <h3 className="font-semibold text-[#C9A84C] mb-1">{selected.label}</h3>
          <p className="text-sm text-[#7A8FA6]">{selected.court} · {selected.year}</p>
          <button onClick={() => setQuery(selected.label)} className="text-xs text-[#C9A84C] hover:underline mt-2 block">
            Research this case →
          </button>
        </div>
      )}

      {/* Legend */}
      {nodes.length > 0 && (
        <div className="flex gap-4 mt-4 text-xs text-[#7A8FA6]">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#C9A84C] inline-block" /> Landmark case</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#0C7B7A] inline-block" /> Recent case</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#1E3A5F] inline-block" /> Related case</span>
        </div>
      )}
    </div>
  );
}
