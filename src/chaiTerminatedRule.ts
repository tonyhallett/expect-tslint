import * as ts from 'typescript';
import { SyntaxKindRule } from './baseRules/syntaxKindRule/SyntaxKindRule';
import { functionLikeKinds } from './kinds/functionLikeKinds';
import { ignoreKinds } from './kinds/ignoreKinds';
import { IncludeExcludeKinds } from './baseRules/IgnoreNodeByKindRule';

export class Rule extends SyntaxKindRule{
  private readonly expectOrShould = ['expect', 'should']

  private terminalProperties = ['ok', 'true', 'false', 'null', 'undefined', 'NaN', 'exist', 'empty', 'Arguments','arguments', 'extensible', 'sealed', 'frozen', 'finite']

  private readonly unterminatedExpectationMessage = 'Unterminated expectation';

  private iterateFunctionLike = (node: ts.FunctionLikeDeclaration) => {
    return node.body?this.iterate(node.body): false;
  }
  
  private isCallExpressionExpect=(callExpression: ts.CallExpression)=>{
    let isExpect = false;
    const expect = callExpression.expression;
    const numArguments = callExpression.arguments.length ;
    if(ts.isIdentifier(expect) && (numArguments === 1 || numArguments === 2)){
      if(this.expectOrShould.indexOf(expect.text)!==-1){
        isExpect = true;
      }
    }
    return isExpect;
  }
  private getLastExpressionInChain = (callExpression: ts.CallExpression) => {
    let lastExpression:ts.PropertyAccessExpression|ts.CallExpression = callExpression;
    while(true){
      const parent:ts.Node = lastExpression.parent;
      if( !(ts.isPropertyAccessExpression(parent)||ts.isCallExpression(parent)) ){
        break;
      } else {
        lastExpression = parent;
      }
    }
    return lastExpression;
  }
  private expressionIsTerminal = (lastExpression:ts.PropertyAccessExpression) => {
    let isTerminal= false;
    const propertyName = lastExpression.name.text;
    if(this.terminalProperties.some(terminal => terminal === propertyName)){
      isTerminal = true;
    }
    return isTerminal;
  }
  private expressionNotTerminated = (lastExpression:ts.PropertyAccessExpression|ts.CallExpression,expectCallExpression:ts.CallExpression) => {
    let notTerminated = true;
    if(lastExpression!==expectCallExpression){
      if(ts.isPropertyAccessExpression(lastExpression)){
        notTerminated = !this.expressionIsTerminal(lastExpression);
      }else{
        notTerminated = false;
      }
    }
    return notTerminated;
  }
  private addUnterminatedFailure = (expectCallExpression:ts.CallExpression) => {
    this.lintContext.addFailureAtNode(expectCallExpression,this.unterminatedExpectationMessage);
  }
  private checkCallExpression = (callExpression: ts.CallExpression) => {
    let iterateFurther = true;
    if(this.isCallExpressionExpect(callExpression)){
      iterateFurther = false;
      
      let notTerminated = this.expressionNotTerminated(this.getLastExpressionInChain(callExpression), callExpression);
      
      if(notTerminated){
        this.addUnterminatedFailure(callExpression);
      }
    }
    
    if(iterateFurther){
      this.iterate(callExpression);
    }
  }
  private addAdditionalTerminals = () => {
    const options = this.getOptions();
    if(options.ruleArguments.length===1){
      const additionalTerminals = options.ruleArguments[0].additionalTerminals;
      if(additionalTerminals.length>1){
        this.terminalProperties = this.terminalProperties.concat(additionalTerminals);
      }
    }
  }
  
  private setSyntaxKindHandlers(){
    this.syntaxKindFunctions.set(ts.SyntaxKind.CallExpression, this.checkCallExpression);
    functionLikeKinds.forEach(k => this.syntaxKindFunctions.set(k as any, this.iterateFunctionLike))
  }
  private setIgnoreKinds(){
    this.ignoreKinds = ignoreKinds;
  }
  protected initialise(){
    this.addAdditionalTerminals();
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
