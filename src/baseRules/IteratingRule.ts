import * as ts from 'typescript';
import * as Lint from 'tslint'
import { WalkContext } from 'tslint';
export abstract class IteratingRule extends Lint.Rules.AbstractRule {
  protected lintContext!: WalkContext;
  protected abstract handleNode(node: ts.Node): boolean | undefined | void;
  protected initialise() {
  }
  protected abstract ignoreNode(node: ts.Node): boolean;
  private iterateNodes = (node: ts.Node): boolean | undefined | void => {
    if (!this.ignoreNode(node)) {
      return this.handleNode(node);
    }
  };
  protected iterate(node: ts.Node) {
    return ts.forEachChild(node, this.iterateNodes);
  }
  apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    this.initialise();
    return this.applyWithFunction(sourceFile, (ctx => {
      this.lintContext = ctx;
      sourceFile.statements.forEach(sf => this.iterateNodes(sf));
    }));
  }
}
