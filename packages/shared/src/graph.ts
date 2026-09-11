import type { SourceLocation } from './source-location';

/**
 * Stable identifier for a graph node.
 *
 * Format and derivation are owned by `graph-core`; other packages must treat
 * the value as opaque and compare it only for exact equality.
 */
export type NodeId = string;

/** The kinds of declaration the graph can represent. */
export type NodeKind =
  | 'file'
  | 'function'
  | 'class'
  | 'method'
  | 'interface'
  | 'type-alias'
  | 'variable';

/** A declaration in the indexed repository. */
export interface GraphNode {
  readonly id: NodeId;
  readonly kind: NodeKind;
  /**
   * Declared name as written in the source. Not unique: two declarations in
   * different scopes may share a name, so never key on this.
   */
  readonly name: string;
  /** Where the declaration itself lives. */
  readonly location: SourceLocation;
}

/** The relationships the graph can represent between two nodes. */
export type EdgeRelation =
  | 'calls'
  | 'imports'
  | 'declares'
  | 'extends'
  | 'implements'
  | 'references';

/** A directed relationship between two nodes. */
export interface GraphEdge {
  readonly from: NodeId;
  readonly to: NodeId;
  readonly relation: EdgeRelation;
  /**
   * The span of source that justifies this edge, e.g. the call expression for
   * a `calls` edge. Always inside the file of the `from` node.
   */
  readonly evidence: SourceLocation;
}
