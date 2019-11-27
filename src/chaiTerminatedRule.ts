import * as Lint from 'tslint'
import * as ts from 'typescript';
import { WalkContext } from 'tslint';
export class Rule extends Lint.Rules.AbstractRule{
  private lintContext!:WalkContext;
  private readonly expectOrShould = ['expect', 'should']

  private terminalProperties = ['ok', 'true', 'false', 'null', 'undefined', 'NaN', 'exist', 'empty', 'Arguments','arguments', 'extensible', 'sealed', 'frozen', 'finite']

  private readonly unterminatedExpectationMessage = 'Unterminated expectation';
  private iterateNodes = (node:ts.Node) => {
    if(ts.isCallExpression(node)){
      this.checkCallExpression(node);
    }
    else{
      ts.forEachChild(node, this.iterateNodes);
    }
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
      ts.forEachChild(callExpression, this.iterateNodes);
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
  
  apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    this.addAdditionalTerminals();
    return this.applyWithFunction(sourceFile,(ctx => {
      this.lintContext = ctx;
      ts.forEachChild(sourceFile, this.iterateNodes);
    }));
  }
  
}