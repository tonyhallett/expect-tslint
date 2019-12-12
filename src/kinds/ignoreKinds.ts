import * as ts from 'typescript';

const ignoreTypesAndDeclarations = [
  ts.SyntaxKind.TypeParameter,
  /*
    excluded by InterfaceDeclaration and TypeLiteral
    ts.SyntaxKind.PropertySignature,
    ts.SyntaxKind.CallSignature,
    ts.SyntaxKind.ConstructSignature,
  */

  ts.SyntaxKind.FunctionType,
  ts.SyntaxKind.ConstructorType,
  
  ts.SyntaxKind.IndexSignature,// as class can have one

  ts.SyntaxKind.TypeReference,
  ts.SyntaxKind.TypePredicate,
  ts.SyntaxKind.TypeQuery,
  ts.SyntaxKind.TypeLiteral,
  ts.SyntaxKind.TypeOperator,
  ts.SyntaxKind.IndexedAccessType,
  ts.SyntaxKind.MappedType,
  ts.SyntaxKind.ArrayType,
  ts.SyntaxKind.TupleType,
  ts.SyntaxKind.UnionType,
  ts.SyntaxKind.IntersectionType,
  ts.SyntaxKind.ConditionalType,
  ts.SyntaxKind.InferType,
  ts.SyntaxKind.ImportType,
  ts.SyntaxKind.OptionalType,
  ts.SyntaxKind.RestType,

  ts.SyntaxKind.InterfaceDeclaration,
  ts.SyntaxKind.TypeAliasDeclaration,
  ts.SyntaxKind.EnumDeclaration, // and thus EnumMember
  
  ts.SyntaxKind.HeritageClause,
]
const ignoreImportExports = [
  ts.SyntaxKind.ImportEqualsDeclaration,
  ts.SyntaxKind.ImportDeclaration, // and thus ImportClause ( NamedImports, ImportSpecifier)
  ts.SyntaxKind.NamespaceImport,
  ts.SyntaxKind.ExportDeclaration, // and thus NamedExports ( ExportSpecifier)
  ts.SyntaxKind.ExportAssignment,//has expression...
]
const ignoreStatements = [
  ts.SyntaxKind.ContinueStatement,
  ts.SyntaxKind.BreakStatement,
]
const ignoreIdentifierOnly = [
  ts.SyntaxKind.NamespaceExportDeclaration,
  ts.SyntaxKind.MetaProperty
]
const ignoreJsx = [
  ts.SyntaxKind.JsxElement,
  ts.SyntaxKind.JsxSelfClosingElement,
  ts.SyntaxKind.JsxFragment, // can exist outside of an element ?
  ts.SyntaxKind.JsxExpression // can exist outside of above
]

export const ignoreKinds = [
  ts.SyntaxKind.QualifiedName,
  ...ignoreTypesAndDeclarations, 
  ...ignoreImportExports, 
  ...ignoreStatements,
  ...ignoreIdentifierOnly,
  ...ignoreJsx,
];
/*
  do not ignore
    ModuleDeclaration as has body which can have code if not ambient namespace, ambient module
*/
/*
  no need to ignore jsdoc as forEachChild does not callback for any properties of these types
*/
