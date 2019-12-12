import * as ts from 'typescript';
import { IgnoreNodeByKindRule } from '../IgnoreNodeByKindRule';
import { SyntaxKindNodeHandler, ISyntaxKindIterator } from "./SyntaxKindNodeHandler";
import { SyntaxKindFunctions } from "./SyntaxKindFunctions";

export abstract class SyntaxKindRule extends IgnoreNodeByKindRule implements ISyntaxKindIterator {
  iterateNode(node: ts.Node): boolean | undefined | void {
    return this.iterate(node);
  }
  public syntaxKindFunctions = new SyntaxKindFunctions();
  private nodeHandler: SyntaxKindNodeHandler = new SyntaxKindNodeHandler(this);
  protected handleNode(node: ts.Node) {
    return this.nodeHandler.handleNode(node);
  }
}
