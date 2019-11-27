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

```typescript
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

```typescript
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