// Headless Disclosure
// Ref: https://w3c.github.io/aria-practices/#disclosure
import React, { useMemo, useReducer, useRef, useCallback } from 'react';
import DisclosureContext, {
  DisclosureAction,
  DisclosureActionTypes,
  DisclosureContextProps,
  DisclosureState
} from './DisclosureContext';
import DisclosureButton from './DisclosureButton';
import DisclosureContent from './DisclosureContent';
import useClickOutside from '../utils/useClickOutside';

export type DisclosureTrigger = 'click' | 'mouseover';

export interface DisclosureRenderProps
  extends Pick<React.HTMLAttributes<HTMLElement>, 'onMouseOver' | 'onMouseOut'> {
  open: boolean;
}

export interface DisclosureProps {
  children: (props: DisclosureRenderProps, ref: React.Ref<HTMLElement>) => React.ReactNode;

  /** Controlled open state */
  open?: boolean;

  /** Whether disclosure is initially expanded */
  defaultOpen?: boolean;
  hideOnClickOutside?: boolean;

  /** Callback when disclosure button is being activated to update the open state */
  onToggle?: (open: boolean, event: React.SyntheticEvent) => void;

  trigger?: DisclosureTrigger[];
}

const initialDisclosureState: DisclosureState = {
  open: false
};

function disclosureReducer(state: DisclosureState, action: DisclosureAction): DisclosureState {
  switch (action.type) {
    case DisclosureActionTypes.Show:
      return { ...state, open: true };
    case DisclosureActionTypes.Hide:
      return { ...state, open: false };
  }
  return state;
}

export interface DisclosureComponent extends React.FC<DisclosureProps> {
  Button: typeof DisclosureButton;
  Content: typeof DisclosureContent;
}

const Disclosure: DisclosureComponent = React.memo((props: DisclosureProps) => {
  const {
    children,
    open: openProp,
    defaultOpen = false,
    hideOnClickOutside = false,
    onToggle,
    trigger = ['click']
  } = props;

  const [{ open: openState }, dispatch] = useReducer(disclosureReducer, {
    ...initialDisclosureState,
    open: defaultOpen
  });

  const containerElementRef = useRef<HTMLElement>(null);

  const open = openProp ?? openState;

  useClickOutside({
    enabled: hideOnClickOutside,
    isOutside: event => !containerElementRef.current?.contains(event.target as HTMLElement),
    handle: () => dispatch({ type: DisclosureActionTypes.Hide })
  });

  const onMouseOver = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (!open) {
        dispatch({ type: DisclosureActionTypes.Show });
        onToggle?.(true, event);
      }
    },
    [open, dispatch, onToggle]
  );
  const onMouseOut = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (open) {
        dispatch({ type: DisclosureActionTypes.Hide });
        onToggle?.(false, event);
      }
    },
    [open, dispatch, onToggle]
  );

  const context = useMemo<DisclosureContextProps>(() => {
    return [{ open }, dispatch, { onToggle, trigger }];
  }, [open, dispatch, onToggle, trigger]);

  const renderProps = useMemo(() => {
    const renderProps: DisclosureRenderProps = { open };

    if (trigger.includes('mouseover')) {
      renderProps.onMouseOver = onMouseOver;
      renderProps.onMouseOut = onMouseOut;
    }

    return renderProps;
  }, [open, trigger, onMouseOver, onMouseOut]);

  return (
    <DisclosureContext.Provider value={context}>
      {children(renderProps, containerElementRef)}
    </DisclosureContext.Provider>
  );
}) as any;

Disclosure.Button = DisclosureButton;
Disclosure.Content = DisclosureContent;

export default Disclosure;
