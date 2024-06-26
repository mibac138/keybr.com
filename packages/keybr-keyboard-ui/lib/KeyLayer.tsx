import { type Keyboard, type KeyShape, useKeyboard } from "@keybr/keyboard";
import {
  type ComponentType,
  memo,
  type ReactElement,
  type ReactNode,
  useMemo,
} from "react";
import { frameWidth } from "./constants.ts";
import { type KeyProps, makeKeyComponent } from "./Key.tsx";

type KeyId = string;
type KeyIdList = readonly KeyId[];

export function addKey(keys: KeyIdList, key: KeyId): KeyIdList {
  const index = keys.indexOf(key);
  if (index === -1) {
    keys = [...keys, key];
  }
  return keys;
}

export function deleteKey(keys: KeyIdList, key: KeyId): KeyIdList {
  const index = keys.indexOf(key);
  if (index !== -1) {
    keys = keys.filter((item) => item !== key);
  }
  return keys;
}

export const KeyLayer = memo(function KeyLayer({
  depressedKeys = [],
  toggledKeys = [],
  showColors = false,
}: {
  readonly depressedKeys?: KeyIdList;
  readonly toggledKeys?: KeyIdList;
  readonly showColors?: boolean;
}): ReactNode {
  const keyboard = useKeyboard();
  const children = useMemo(() => getKeyElements(keyboard), [keyboard]);
  return (
    <svg x={frameWidth} y={frameWidth}>
      {children.map((child) =>
        child.select(depressedKeys, toggledKeys, showColors),
      )}
    </svg>
  );
});

function getKeyElements(keyboard: Keyboard): MemoizedKeyElements[] {
  return [...keyboard.shapes.values()].map(
    (shape) => new MemoizedKeyElements(keyboard, shape),
  );
}

class MemoizedKeyElements {
  readonly component: ComponentType<KeyProps>;
  readonly state0: ReactElement<KeyProps>;
  readonly state1: ReactElement<KeyProps>;
  readonly state2: ReactElement<KeyProps>;
  readonly state3: ReactElement<KeyProps>;
  readonly state4: ReactElement<KeyProps>;
  readonly state5: ReactElement<KeyProps>;
  readonly state6: ReactElement<KeyProps>;
  readonly state7: ReactElement<KeyProps>;

  constructor(
    readonly keyboard: Keyboard,
    readonly shape: KeyShape,
  ) {
    const Component = makeKeyComponent(keyboard.layout.language, shape);
    this.component = Component;
    this.state0 = (
      <Component
        key={shape.id}
        depressed={false}
        toggled={false}
        showColors={false}
      />
    );
    this.state1 = (
      <Component
        key={shape.id}
        depressed={true}
        toggled={false}
        showColors={false}
      />
    );
    this.state2 = (
      <Component
        key={shape.id}
        depressed={false}
        toggled={true}
        showColors={false}
      />
    );
    this.state3 = (
      <Component
        key={shape.id}
        depressed={true}
        toggled={true}
        showColors={false}
      />
    );
    this.state4 = (
      <Component
        key={shape.id}
        depressed={false}
        toggled={false}
        showColors={true}
      />
    );
    this.state5 = (
      <Component
        key={shape.id}
        depressed={true}
        toggled={false}
        showColors={true}
      />
    );
    this.state6 = (
      <Component
        key={shape.id}
        depressed={false}
        toggled={true}
        showColors={true}
      />
    );
    this.state7 = (
      <Component
        key={shape.id}
        depressed={true}
        toggled={true}
        showColors={true}
      />
    );
  }

  select(
    depressedKeys: KeyIdList,
    toggledKeys: KeyIdList,
    showColors: boolean,
  ): ReactElement<KeyProps> {
    const { shape } = this;
    const depressed = depressedKeys.includes(shape.id);
    const toggled = toggledKeys.includes(shape.id);
    if (!showColors) {
      if (!toggled) {
        if (!depressed) {
          return this.state0;
        } else {
          return this.state1;
        }
      } else {
        if (!depressed) {
          return this.state2;
        } else {
          return this.state3;
        }
      }
    } else {
      if (!toggled) {
        if (!depressed) {
          return this.state4;
        } else {
          return this.state5;
        }
      } else {
        if (!depressed) {
          return this.state6;
        } else {
          return this.state7;
        }
      }
    }
  }
}
