
import * as ts from 'typescript';
import { ignoreKinds } from './kinds/ignoreKinds';
import { functionLikeKinds } from './kinds/functionLikeKinds';
import { SyntaxKindRule } from './baseRules/syntaxKindRule/SyntaxKindRule';
import { IncludeExcludeKinds } from './baseRules/IgnoreNodeByKindRule';

export class Rule extends SyntaxKindRule{
  private expectDisallowed:boolean = false;
  private expectInPromise = false;
  private aliases!: string[];
  
  
  private iterateFunctionLike = (node: ts.FunctionLikeDeclaration) => {
    return node.body?this.iterate(node.body): false;
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
        this.iterate(argument);
        this.expectDisallowed = false;
        this.expectInPromise = false;
      }
    }
    if(iterateFurther){
      this.iterate(callExpression);
    }
  }
  private checkCatch = (node: ts.TryStatement) => {
    if(node.catchClause){
      this.expectDisallowed = true;
      this.iterate(node.catchClause.block);
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
  private setSyntaxKindHandlers(){
    this.syntaxKindFunctions.set(ts.SyntaxKind.TryStatement, this.checkCatch);
    this.syntaxKindFunctions.set(ts.SyntaxKind.CallExpression, this.checkCallExpression);
    functionLikeKinds.forEach(k => this.syntaxKindFunctions.set(k as any, this.iterateFunctionLike))
  }
  private setIgnoreKinds(){
    this.ignoreKinds = ignoreKinds;
  }
  protected initialise(){
    this.setAliases();
    this.setSyntaxKindHandlers();
    this.setIgnoreKinds();
  }
  protected getIncludeExcludeKindsFromOptions(){
    let includeExcludeKinds: IncludeExcludeKinds | undefined;
    const options = this.getOptions();
    if(options.ruleArguments.length===1){
      includeExcludeKinds = options.ruleArguments[0].includeExcludeKinds;
    }
    return includeExcludeKinds? includeExcludeKinds: {};
  }
}
