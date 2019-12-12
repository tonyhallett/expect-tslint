import * as ts from'typescript';
export type SyntaxKindFunction<T extends ts.Node = ts.Node> = (node:T)=>boolean | undefined | void
export class SyntaxKindFunctions {
  private map: Map<ts.SyntaxKind, SyntaxKindFunction> = new Map();
  set<T extends ts.Node>(kind: T["kind"], handler: SyntaxKindFunction<T>): void {
    this.map.set(kind, handler as any);
  }
  get(kind: ts.SyntaxKind) {
    return this.map.get(kind);
  }
}
