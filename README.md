# Expect-tslint


```
npm install --save-dev expect-tslint
```

## Custom tslint rules

There are two tslint rules, no-expect-in-catch and chai-terminated.
Add the rule to your tslint.json rules section and add expect-tslint to the rulesDirectory.

### no-expect-in-catch
Will error if there are expect calls in a catch handler or in promise catch method.
An expect call is a method call with one or two arguments with name expect.  The name can be changed through the options. Include expect if you want to match against it.

```json
{
  "rules": {
    "no-expect-in-catch": {
      "options": {"aliases": ["expect", "should"]}
    }
  },
  "rulesDirectory": ["expect-tslint"]
}
```

Note that the following will not be considered an expect call with either rule.

```typescript
something.expect(someArg);
```

### chai-terminated
Will error if
```typescript
expect(somethingToExpect);
```
or if the chain is not terminated.  The chain is terminated by a method call ( there is no checking that this is a valid method) or by one of the following properties :
'ok', 'true', 'false', 'null', 'undefined', 'NaN', 'exist', 'empty', 'Arguments','arguments', 'extensible', 'sealed', 'frozen', 'finite'

Through options it is possible to provide additional terminal properties, such as rejected or fulfilled if using chai-as-promised.

```json
{
  "rules": {
    "chai-terminated": {
      "options": {"additionalTerminals": ["rejected", "fulfilled"]}
    }
  },
  "rulesDirectory": ["expect-tslint"]
}
```

With this rule, an expect call is the same as for no-expect-in-catch with method name expect or should.

## Controlling the walk

Both rules are set up to not forEachChild for specific SyntaxKind.  These can be found at [ignoreKinds.ts](../master/src/kinds/ignoreKinds.ts).

Through options it is possible exclude further SyntaxKind or include ones that I have excluded.

Use cases:

1) I have excluded InterfaceDeclaration but it is possible that you have applied a decorator ( that you will custom transform later) and need to check it.

e.g

```typescript
function FakeDecorator(fake:any){}

// @ts-ignore
@FakeDecorator(() => {
  expect('this');
})
interface IDecoratedInterface {}

```

2) For some strange reason there are a lot of classes and you know it is safe to ignore them.


To include and exclude use the includeExcludeKinds options property.
** do not use ts.SyntaxKind... **

```json
{
  "rules": {
    "chai-terminated": {
      "options": {
        "includeExcludeKinds": {
          "exclude": ["ClassDeclaration"],
          "include": ["InterfaceDeclaration"]
        }
      }
    }
  },
  "rulesDirectory": ["expect-tslint"]
}
```
