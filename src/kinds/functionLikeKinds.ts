import * as ts from 'typescript';

export const functionLikeKinds = [
  ts.SyntaxKind.FunctionDeclaration, 
  ts.SyntaxKind.MethodDeclaration, 
  ts.SyntaxKind.Constructor, 
  ts.SyntaxKind.GetAccessor, 
  ts.SyntaxKind.SetAccessor, 
  ts.SyntaxKind.FunctionExpression, 
  ts.SyntaxKind.ArrowFunction
]