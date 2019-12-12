import * as ts from 'typescript';
import { IteratingRule } from './IteratingRule';
export interface IncludeExcludeKinds{
  include?:string[],
  exclude?:string[]
}
interface ParsedIncludeExcludeKinds {
  include: ts.SyntaxKind[] | undefined,
  exclude: ts.SyntaxKind[] | undefined
}

export abstract class IgnoreNodeByKindRule extends IteratingRule {
  private appliedOptions = false;
  protected ignoreKinds: ts.SyntaxKind[] = [];
  protected getIncludeExcludeKindsFromOptions(): IncludeExcludeKinds {
    return {};
  }
  private parseKindOption(kinds:string[]): ts.SyntaxKind[]{
    return kinds.map(k=> ts.SyntaxKind[k as any] as unknown as ts.SyntaxKind);
  }
  private getParsedIncludeExcludeKinds(): ParsedIncludeExcludeKinds{
    const { include, exclude } = this.getIncludeExcludeKindsFromOptions();
    let parsedInclude: ts.SyntaxKind[] | undefined;
    let parsedExclude: ts.SyntaxKind[] | undefined;
    if(include){
      parsedInclude = this.parseKindOption(include);
    }
    if(exclude){
      parsedExclude = this.parseKindOption(exclude);
    }
    return {
      include: parsedInclude,
      exclude: parsedExclude
    }
  }
  protected ignoreNode(node: ts.Node) {
    if (!this.appliedOptions) {
      const { include, exclude } = this.getParsedIncludeExcludeKinds();
      if (include) {
        this.ignoreKinds = this.ignoreKinds.filter(k => !include.some(i => i === k));
      }
      if (exclude) {
        this.ignoreKinds = [...this.ignoreKinds, ...exclude];
      }
      this.appliedOptions = true;
    }
    return this.ignoreKinds.some(i => i === node.kind);
  }
}
