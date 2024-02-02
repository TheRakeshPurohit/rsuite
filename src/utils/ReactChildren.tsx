import React from 'react';

function typeOf(object) {
  if (typeof object === 'object' && object !== null) {
    return object.type || object.$$typeof;
  }
}

function isFragment(children: React.ReactNode) {
  return React.Children.count(children) === 1 && typeOf(children) === Symbol.for('react.fragment');
}

function getChildren(children: React.ReactNode) {
  return isFragment(children) ? (children as React.ReactElement).props?.children : children;
}

export function find(children: React.ReactNode, func: any, context?: any) {
  let index = 0;
  let result: React.ReactNode;

  React.Children.forEach(getChildren(children), child => {
    if (result) {
      return;
    }
    index += 1;
    if (func.call(context, child, index)) {
      result = child;
    }
  });

  return result;
}

export function map(children: React.ReactNode, func: any, context?: any) {
  let index = 0;

  return React.Children.map(getChildren(children), child => {
    if (!React.isValidElement(child)) {
      return child;
    }
    const handle = func.call(context, child, index);
    index += 1;
    return handle;
  });
}

export function mapCloneElement(children: React.ReactNode, func: any, context?: any) {
  return map(
    children,
    (child: React.DetailedReactHTMLElement<any, HTMLElement>, index: number) =>
      React.cloneElement(child, {
        key: index,
        ...func(child, index)
      }),
    context
  );
}

export function count(children: React.ReactNode) {
  return React.Children.count(Array.isArray(children) ? children.filter(child => child) : children);
}

function some(children: React.ReactNode, func: any, context?: any) {
  let index = 0;
  let result = false;

  React.Children.forEach(getChildren(children), child => {
    if (result) {
      return;
    }
    if (!React.isValidElement(child)) {
      return;
    }

    /* eslint-disable */
    if (func.call(context, child, (index += 1))) {
      result = true;
    }
  });

  return result;
}

export default {
  mapCloneElement,
  count,
  some,
  map,
  find
};
