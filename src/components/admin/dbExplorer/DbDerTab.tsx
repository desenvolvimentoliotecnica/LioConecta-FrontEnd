import "@xyflow/react/dist/style.css";
import dagre from "@dagrejs/dagre";
import { useCallback, useEffect, useState } from "react";
import {
  Background,
  Controls,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  type Node,
  type Edge,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import {
  useDbDerLayout,
  useDbSchemaGraph,
  useDeleteDbDerLayout,
  useSaveDbDerLayout,
} from "../../../api/hooks/useDbExplorer";
import type { DbSchemaGraphColumnDto, DbSchemaGraphEdgeDto, DbSchemaGraphNodeDto, DerLayoutState } from "../../../api/types/dbExplorer";

type TableNodeData = {
  label: string;
  schema: string;
  columns: DbSchemaGraphNodeDto["columns"];
  collapsed: boolean;
};

function TableNode({ data }: { data: TableNodeData }) {
  const visible = data.collapsed ? data.columns.slice(0, 4) : data.columns.slice(0, 8);
  return (
    <div className="db-explorer-der-node">
      <Handle type="target" position={Position.Left} />
      <div className="db-explorer-der-node__head">
        <i className="fa-solid fa-table" aria-hidden="true" /> {data.schema}.{data.label}
      </div>
      <ul className="db-explorer-der-node__cols">
        {visible.map((col: DbSchemaGraphColumnDto) => (
          <li key={col.name}>
            {col.isPrimaryKey ? <i className="fa-solid fa-key" title="PK" /> : null}
            {col.isForeignKey ? <i className="fa-solid fa-link" title="FK" /> : null}
            <span>{col.name}</span>
            <small>{col.dataType}</small>
          </li>
        ))}
        {data.columns.length > visible.length ? (
          <li className="db-explorer-der-node__more">+{data.columns.length - visible.length} colunas</li>
        ) : null}
      </ul>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

const nodeTypes = { tableNode: TableNode };

function layoutGraph(nodes: Node[], edges: Edge[]) {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "TB", nodesep: 40, ranksep: 60 });
  nodes.forEach((n) => g.setNode(n.id, { width: 220, height: 120 }));
  edges.forEach((e) => g.setEdge(e.source, e.target));
  dagre.layout(g);
  return nodes.map((node) => {
    const pos = g.node(node.id);
    return { ...node, position: { x: pos.x - 110, y: pos.y - 60 } };
  });
}

type Props = {
  connectionId: string;
};

export function DbDerTab({ connectionId }: Props) {
  const graphQuery = useDbSchemaGraph(connectionId);
  const layoutQuery = useDbDerLayout(connectionId);
  const saveLayout = useSaveDbDerLayout();
  const deleteLayout = useDeleteDbDerLayout();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [dirty, setDirty] = useState(false);

  const buildFromGraph = useCallback(
    (saved?: DerLayoutState | null) => {
      const graph = graphQuery.data;
      if (!graph) return;
      const flowNodes: Node[] = graph.nodes.map((n: DbSchemaGraphNodeDto) => ({
        id: n.id,
        type: "tableNode",
        position: saved?.nodes[n.id]
          ? { x: saved.nodes[n.id].x, y: saved.nodes[n.id].y }
          : { x: 0, y: 0 },
        data: {
          label: n.name,
          schema: n.schema,
          columns: n.columns,
          collapsed: saved?.nodes[n.id]?.collapsed ?? false,
        } satisfies TableNodeData,
      }));
      const flowEdges: Edge[] = graph.edges.map((e: DbSchemaGraphEdgeDto) => ({
        id: e.id,
        source: e.sourceNodeId,
        target: e.targetNodeId,
        label: e.sourceColumn,
        type: "smoothstep",
      }));
      const laidOut =
        saved?.nodes && Object.keys(saved.nodes).length > 0
          ? flowNodes
          : layoutGraph(flowNodes, flowEdges);
      setNodes(laidOut);
      setEdges(flowEdges);
    },
    [graphQuery.data, setEdges, setNodes],
  );

  useEffect(() => {
    if (!graphQuery.data) return;
    let saved: DerLayoutState | null = null;
    if (layoutQuery.data?.layoutJson) {
      try {
        saved = JSON.parse(layoutQuery.data.layoutJson) as DerLayoutState;
      } catch {
        saved = null;
      }
    }
    buildFromGraph(saved);
  }, [graphQuery.data, layoutQuery.data, buildFromGraph]);

  const onAutoLayout = () => {
    setNodes((current) => layoutGraph(current, edges));
    setDirty(true);
  };

  const onSave = async () => {
    const layout: DerLayoutState = {
      viewport: { x: 0, y: 0, zoom: 1 },
      nodes: Object.fromEntries(nodes.map((n) => [n.id, { x: n.position.x, y: n.position.y }])),
    };
    await saveLayout.mutateAsync({ connectionId, layoutJson: JSON.stringify(layout) });
    setDirty(false);
  };

  const onReset = async () => {
    await deleteLayout.mutateAsync(connectionId);
    buildFromGraph(null);
    setDirty(false);
  };

  if (graphQuery.isLoading) return <p className="db-explorer-muted">Carregando diagrama…</p>;
  if (graphQuery.isError) return <p className="db-explorer-error">Falha ao carregar DER.</p>;

  return (
    <div className="db-explorer-der">
      <div className="db-explorer-der__toolbar">
        <button type="button" className="workers-btn workers-btn--ghost" onClick={onAutoLayout}>
          <i className="fa-solid fa-wand-magic-sparkles" aria-hidden="true" /> Auto-layout
        </button>
        <button
          type="button"
          className="workers-btn workers-btn--primary"
          onClick={() => void onSave()}
          disabled={saveLayout.isPending}
        >
          <i className="fa-solid fa-floppy-disk" aria-hidden="true" /> Salvar layout
          {dirty ? " *" : ""}
        </button>
        <button type="button" className="workers-btn workers-btn--ghost" onClick={() => void onReset()}>
          <i className="fa-solid fa-rotate-left" aria-hidden="true" /> Resetar
        </button>
        <span className="db-explorer-muted">{graphQuery.data?.nodes.length ?? 0} tabelas</span>
      </div>
      <div className="db-explorer-der__canvas" style={{ height: "min(72vh, 640px)" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={(changes) => {
            onNodesChange(changes);
            setDirty(true);
          }}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background gap={16} />
          <MiniMap pannable zoomable />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}
