import * as ts from 'typescript';
import { SyntaxKindFunctions } from "./SyntaxKindFunctions";

export interface ISyntaxKindIterator{
  syntaxKindFunctions: SyntaxKindFunctions,
  iterateNode(node:ts.Node): boolean | undefined | void;
}
export class SyntaxKindNodeHandler {
  constructor(private syntaxKindIterator: ISyntaxKindIterator) { }
  public handleNode(node: ts.Node): boolean | undefined | void {
    const syntaxKindFunction = this.syntaxKindIterator.syntaxKindFunctions.get(node.kind);
    if (syntaxKindFunction) {
      return syntaxKindFunction(node);
    }
    return this.syntaxKindIterator.iterateNode(node);
  }
}
