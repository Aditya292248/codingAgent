import type { GraphEdge, GraphNode, NodeId } from 'shared';

/**
 * The public surface of the graph engine.
 *
 * Indexing and query execution arrive in a later change; this package
 * currently owns only the types that describe that surface, so that the
 * extension and CLI can be written against a stable contract.
 */
export interface RepositoryGraph {
  /** All indexed declarations. */
  readonly nodes: readonly GraphNode[];
  /** All indexed relationships. */
  readonly edges: readonly GraphEdge[];
}

/** Options accepted by a future indexing run. */
export interface IndexOptions {
  /** Absolute path to the repository root. */
  readonly repositoryRoot: string;
  /** Repository-relative glob patterns to exclude. */
  readonly exclude?: readonly string[];
}

/** A request to walk the graph outward from one node. */
export interface NeighborQuery {
  readonly nodeId: NodeId;
  readonly direction: 'outgoing' | 'incoming' | 'both';
}

/** Version of the on-disk index format. Bump on any breaking change. */
export const GRAPH_FORMAT_VERSION = 1;

/** An empty graph. Useful as an initial value and in tests. */
export function emptyGraph(): RepositoryGraph {
  return { nodes: [], edges: [] };
}

/** Number of nodes and edges in a graph, for display in the CLI and editor. */
export function describeGraph(graph: RepositoryGraph): string {
  return `${graph.nodes.length} nodes, ${graph.edges.length} edges`;
}
