import * as Lint from 'tslint'
import * as ts from 'typescript';
import { WalkContext } from 'tslint';
export class Rule extends Lint.Rules.AbstractRule{
  private expectDisallowed:boolean = false;
  private expectInPromise = false;
  
  private lintContext!:WalkContext;
  private aliases!: string[];

  private iterateNodes = (node:ts.Node) => {
    if(ts.isTryStatement(node)){
      this.checkCatch(node.catchClause)
    }
    if(ts.isCallExpression(node)){
      this.checkCallExpression(node);
    }
    else{
      ts.forEachChild(node, this.iterateNodes);
    }
  }
  private callExpressionIsCatch = (callExpression:ts.CallExpression) => {
    let argument: ts.ArrowFunction | ts.FunctionExpression | undefined;
    const propertyAccessExpression = callExpression.expression;
    if(ts.isPropertyAccessExpression(propertyAccessExpression)  && propertyAccessExpression.name.text === 'catch'){
      if(callExpression.arguments.length===1){
        const arg= callExpression.arguments[0];
        if(ts.isArrowFunction(arg)||ts.isFunctionExpression(arg)){
          argument = arg;
        }
      }
    }
    return argument;
  }
  private addFailure = (expectCallExpression:ts.CallExpression, expectAlias:string) => {
    this.lintContext.addFailureAtNode(expectCallExpression,`${expectAlias} call in${this.expectInPromise?' promise':''} catch${this.expectInPromise?'':' handler'}`);
  }
  private callExpressionIsExpect = (callExpression:ts.CallExpression) => {
    let expectAlias:string|undefined;
    const expect = callExpression.expression;
    const numArguments = callExpression.arguments.length ;
    if(ts.isIdentifier(expect) && (numArguments === 1 || numArguments === 2)){
      const aliasIndex = this.aliases.indexOf(expect.text);
      if(aliasIndex!==-1){
        expectAlias = this.aliases[aliasIndex];
      }
    }
    return expectAlias;
  }
  private checkCallExpression = (callExpression: ts.CallExpression) => {
    let iterateFurther = true;
    if(this.expectDisallowed){
      const expectAlias = this.callExpressionIsExpect(callExpression);
      if(expectAlias!==undefined){
        iterateFurther = false;
        this.addFailure(callExpression,expectAlias);
      }
    }else{
      const argument = this.callExpressionIsCatch(callExpression);
      if(argument){
        iterateFurther = false;
        
        this.expectInPromise = true;
        this.expectDisallowed = true;
        ts.forEachChild(argument, this.iterateNodes);
        this.expectDisallowed = false;
        this.expectInPromise = false;
      }
    }
    if(iterateFurther){
      ts.forEachChild(callExpression, this.iterateNodes);
    }
  }
  private checkCatch = (catchClause: ts.CatchClause | undefined) => {
    if(catchClause){
      this.expectDisallowed = true;
      ts.forEachChild(catchClause.block, this.iterateNodes);
      this.expectDisallowed = false;
    }
  }
  private setAliases = () => {
    const options = this.getOptions();
    if(options.ruleArguments.length===1){
      this.aliases = options.ruleArguments[0].aliases;
    }else{
      this.aliases=[];
    }
    
    if(this.aliases.length===0){
      this.aliases=['expect'];
    }
  }
  apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    this.setAliases();
    return this.applyWithFunction(sourceFile,(ctx => {
      this.lintContext = ctx;
      ts.forEachChild(sourceFile, this.iterateNodes);
    }));
  }
  
}