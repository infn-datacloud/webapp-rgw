## React Hooks (Services)

Services are pieces of code implementing a set of functionalities or activities
logically tied together to perform a specific task and/or interact with an
external system. Example of services are the `S3` service, which allows the
interaction with the S3 backend and perform buckets operations, or the
`Notifications` service, that handle all the logic of push notifications.

Services are implemented similarly to the native
[React Hooks](https://react.dev/reference/react/hooks), empowering the notion
of [Contexts](https://react.dev/reference/react/useContext) in order to 
make service accessible globally.

Let's say that we want to build the `Unicorns` service that ask to some external
server (API) to get the list of all the Unicorns present in the database,
or to add a new one.
Would be nice to be able to use this service like

```jsx
import { useUnicorns, type Unicorn } from './services/unicorns';
import { useState, useEffect } from 'react';

const AwesomeComponent = (): JSX => {
  const { getUnicorns, addUnicorn } = useUnicorns;  // hook!
  const [unicorns, setUnicorns] = useState<Unicorn[]>([]);

  useEffect(() => {
    const foundUnicorns: Unicorn[] = getUnicorns();
    setUnicornsCount(foundUnicorns);
  });

  return (
    <>
      <div>We have {unicorns.length}</div>
      <button onclick={() => addUnicorn("James")}>
        Click to add a Unicorn!
      </button>
    </>
  )
}
```

## Service Provider

In order to use the `useUnicorns` hook, the hook must be called within its own
[Context Provider](https://react.dev/reference/react/useContext).

Continuing with the above `Unicorns` service example, `AwesomeComponent` must
be defined with the `UnicornContext`

```jsx
// App.tsx
import { UnicornsContext } from './services/unicorns';
import { AwesomeComponent } from './components/awesome';

const App = (): JSX => {
  return (
    <UnicornsContext.Provider value="some default value">
      <AwesomeComponent />
    <UnicornsContext.Provider />
  )
} 
```

Otherwise, it could be handy to have something like

```jsx
// App.tsx
import { withUnicorns, type UnicornsProps } from './service/unicorns';
import { AwesomeComponent } from './components/awesome';

const App = (): JSX => {
  const unicornsProps: UnicornsProps = { ... };
  const SuperAwesomeComponent = withUnicorns(AwesomeComponent, unicornsProps);
  
  return (
    <SuperAwesomeComponent />
  )
}
```

## Anatomy of a Service

Let's see now how a service/hook is structured and how to organize its code.
Our `Unicorns` service will have the following structure

```shell
app/src/services
└── Unicorns
    ├── index.ts                # mandatory
    ├── reducer.ts              # optional
    ├── UnicornsContext.tsx     # mandatory
    ├── UnicornsProvider.tsx    # mandatory
    ├── UnicornsState.ts        # optional
    ├── types.ts                # optional
    ├── useUnicorns.ts          # mandatory
    └── withUnicorns.tsx        # mandatory
```

### `index.ts`

Let's start with mandatory files. `index.ts` expose all the exported fields that
we want to make publicly accessible, for example

```ts
// index.ts
export { UnicornsProvider } from "./UnicornsProvider";
export { type Unicorn } from "./types";
export { withUnicorns } from "./withUnicorns";
export { useUnicorns } from "./useUnicorns";
```

and this allows use to import everything from `./service/Unicorns`, i.e.:

```jsx
// App.tsx
import { withUnicorns } from "./services/Unicorns";

const App = (): JSX => {
  const SuperAwesomeComponent = withUnicorns(AwesomeComponent);
  ...
}

...
```

and 

```jsx
// AwesomeComponent.tsx
import { useUnicorns, type Unicorn } from "./services/Unicorns";

const AwesomeComponent = (): JSX => {
  const { getAllUnicorns } = useUnicorns();
  ...
}
```

## Service Context

The service context defines the interface of our service (i.e. all the available
service's methods) and create and sets the context using the
React's [createContext](https://react.dev/reference/react/createContext)
function.

Suppose that our service must define the `getAllUnicorns` and `addUnicorn`
functions. Our `UnicornsContext.tsx` will be something like

```jsx
// UnicornsContext.tsx
import { type Unicorn } from './types';
import { createContext } from 'react';

export interface UnicornsContextProps {
  getAllUnicorns: () => Unicorn[];
  addUnicorn: (name: string) => void;
}


export const UnicornsContext = 
  createContext<UnicornsContextProps | undefined>(undefined);
```

In the above snipped we create the context as `undefined`. We'll set it when
we create the context provider.

## Service Provider

The service provider is the component that implements the actual logic. It is
full-fledged standard React component which implements all the methods listed
in the context interface.

```jsx
// UnicornsProvider.tsx
import { type UnicornsContext } from './UnicornsContext'

// we want enable children components to access our context provider
interface UnicornsProviderPropsBase {
  children?: React.ReactNode;
}

// here we can add initialization parameters, such as credentials to access the 
// API
export interface UnicornsProviderProps extends UnicornsProviderPropsBase {
  user: string;
  password: string;
}


export const UnicornsProvider = (props: UnicornsProviderProps): JSX => {
  const { user, password } = props;
  const { children } = props;

  const getAllUnicorns = async () => Unicorn[] {
    const credentials = btoa(`${user}:${password}`);
    const response = await fetch('/unicorns', {
      headers: {
        Authorization: `Basic ${credentials}`
      }
    });
    return await response.json();
  }

  const addUnicorn = async (name: string) => {
    const credentials = btoa(`${user}:${password}`); 
    await fetch('/unicorns', {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        Content-Type: "application/json"
      },
      body: JSON.stringify({unicornName: name});
    });
  }

  return (
    <UnicornsContext.Provider 
      value={{
        getAllUnicorns,
        addUnicorn
      }}
    >
      {children}
    </UnicornsContext.Provider>
  )
}
```

## Use Service (Hook)

Let's see now how to implement the `useUnicorns` hook. To get access to the
`UnicornsContext`, we use the React's `useContext` function

```jsx
// useUnicorns.tsx
import { useContext };
import { UnicornsContext, type UnicornsContextProps } from "./UnicornsContext";

export const useUnicorns = (): UnicornsContextProps => {
  const context = useContext(UnicornsContext);
  if (!context) {
    throw new Error(
      "UnicornsContext is undefined, please verify you are calling " +
      "'useUnicorns' as a child of <UnicornsProvider> component."
    );
  }
  return context;
}
```

As you can see, we check if the context is well defined. It means that the
context must be forwarded to the component which will utilize the `useUnicorns`
hook, as child of the `UnicornsProvider` component.

## Extend components with service

Actually we already have everything needed to initialize and use the service.
If we want forward the `UnicornsContext` to all children component we can
write something like

```jsx
// App.jsx
import { 
  UnicornsProvider,
  type UnicornsProviderProps
} from './services/Unicorns';

const App = (): JSX => {
  const unicornsConfig: UnicornsProviderProps = { ... }; 
  // stuff
  return (
    <UnicornsProvider {...unicornsConfig}>
      <AwesomeComponent />
    </UnicornsProvider>
  );
}
```

This is nice, but the "sandwich" can escalate quickly. Indeed, if we add another
service, we need to rewrite the returned value such as

```jsx
  return (
    <AnotherServiceProvider>
        <UnicornsProvider {...unicornsConfig}>
          <AwesomeComponent />
        </UnicornsProvider>
    </AnotherServiceProvider>
  );
```

Adding one more service will add a new level of nesting. As alternative we can
hide the nesting wrapping our component in new function called `withUnicorns`
which returns an "augmented" version of the `AwesomeComponent` with the service
exposed

```jsx
// withUnicorns.tsx
import { 
  UnicornsProvider,
  type UnicornsProviderProps
} from './services/Unicorns';

type Props = {
  Comp?: React.ComponentType
}

export function withUnicorns(WrappedComponent: React.FunctionComponent<Props>,
  unicornsConfig: UnicornsProviderProps) {
  return function (props: Props) {
    return (
      <UnicornsProvider {...unicornsConfig}>
        <WrappedComponent {...props} />
      </UnicornsProvider>
    );
  };
}
```

Now we can extend our component with all the services that we want

```jsx
// App.tsx
import { withUnicorns } from "./services/Unicorns";
import { withElves } from "./services/Elves";

const App = (): JSX =>  {
  // more stuff
  let SuperAwesomeComponent = withUnicorns(AwesomeComponent);
  SuperAwesomeComponent = withElves(SuperAwesomeComponent);
  return (
    <SuperAwesomeComponent />
  )
}
```

## Other files

Our service can be quite complex and thus it may require some advanced
functionalities. For example, an authentication service may need to handle a
user that can potentially be in one of many different states, such
`loggingIn`, `loggedIn`, `loggingOut`, `loggingOut` etc. In such cases, it comes
the use of [useReducer](https://react.dev/reference/react/useReducer) hooks.

To use the reducer, we can create a `UnicornsState.ts` file which defines
the state interface and a default state value. Then, we create a `reducer.ts`
file where we write the reducer implementation. Keeping this convention helps
use to quickly see by eye how the service state is managed and update, without
searching among hundreds of lines of code.

Our Unicorns example will be similar to

```jsx
// UnicornsProvider.tsx
import { useReducer } from "react";
import { reducer } from "./reducer";
import { initialState } from "./UnicornsState";

export const UnicornsProvider = (...): JSX => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const login() => {
    // do stuff
    dispatch({type: "LOGGED_IN" });
  }

  const foo() => {
    const { loggedIn } = state;
    if (loggedIn) {
      console.log("We are logged in!");
    }
  }
}
```
