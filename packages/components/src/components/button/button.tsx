import * as React from 'react';
import classNames from 'classnames';
import { ConfigContext } from '../config-provider';
import SizeContext from '../config-provider/SizeContext';
import { LoadingOutlined } from '@gio-design/icons';
import { ButtonProps } from './interface';
import { cloneElement } from '../../utils/reactNode';

const rxTwoCNChar = /^[\u4e00-\u9fa5]{2}$/;
const isTwoCNChar = rxTwoCNChar.test.bind(rxTwoCNChar);

function isString(str: any) {
  return typeof str === 'string';
}

function insertSpace(child: React.ReactChild, needInserted: boolean) {
  if (child === null || child === undefined) {
    return null;
  }
  const SPACE = needInserted ? ' ' : '';
  if (
    typeof child !== 'string' &&
    typeof child !== 'number' &&
    isString(child.type) &&
    isTwoCNChar(child.props.children)
  ) {
    return cloneElement(child, {
      children: child.props.children.split('').join(SPACE),
    });
  }
  if (typeof child === 'string') {
    if (isTwoCNChar(child)) {
      return <span>{child.split('').join(SPACE)}</span>;
    } else {
      return <span>{child}</span>;
    }
  }
  return child;
}

function spaceChildren(children: React.ReactNode, needInserted: boolean) {
  let isPrevChildPure = false;
  const childList: React.ReactNode[] = [];
  React.Children.forEach(children, (child) => {
    const type = typeof child;
    const isCurrentChildPure = type === 'string' || type === 'number';
    if (isPrevChildPure && isCurrentChildPure) {
      const lastIndex = childList.length - 1;
      const lastChild = childList[lastIndex];
      childList[lastIndex] = `${lastChild}${child}`;
    } else {
      childList.push(child);
    }

    isPrevChildPure = isCurrentChildPure;
  });

  return React.Children.map(childList, (child) => insertSpace(child as React.ReactChild, needInserted));
}

interface CompoundedComponent extends React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLElement>> {
  __GIO_BUTTON: boolean;
}

const InternalButton: React.ForwardRefRenderFunction<unknown, ButtonProps> = (props, ref) => {
  const {
    loading,
    prefixCls: customizePrefixCls,
    type,
    size: customizeSize,
    className,
    children,
    icon,
    ghost,
    block,
    ...rest
  } = props;

  const size = React.useContext(SizeContext);
  const [innerLoading, setLoading] = React.useState<boolean | undefined>(loading);
  const [hasTwoCNChar, setHasTwoCNChar] = React.useState(false);
  const { getPrefixCls, autoInsertSpaceInButton } = React.useContext(ConfigContext);
  const buttonRef = (ref as any) || React.createRef<HTMLElement>();

  const isNeedInserted = () => React.Children.count(children) === 1 && !icon;

  const fixTwoCNChar = () => {
    if (!buttonRef || !buttonRef.current || autoInsertSpaceInButton === false) {
      return;
    }
    const buttonText = buttonRef.current.textContent;

    if (isNeedInserted() && isTwoCNChar(buttonText)) {
      if (!hasTwoCNChar) {
        setHasTwoCNChar(true);
      }
    } else if (hasTwoCNChar) {
      setHasTwoCNChar(false);
    }
  };

  React.useEffect(() => {
    setLoading(loading);
  }, [loading]);

  React.useEffect(() => {
    fixTwoCNChar();
  }, [buttonRef]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement, MouseEvent>) => {
    const { onClick } = props;
    if (innerLoading) {
      return;
    }
    if (onClick) {
      (onClick as React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>)(e);
    }
  };

  const prefixCls = getPrefixCls('btn', customizePrefixCls);
  const autoInsertSpace = autoInsertSpaceInButton !== false;

  const sizeCls = customizeSize || size;
  const iconType = innerLoading ? 'loading' : icon;

  const classes = classNames(prefixCls, className, {
    [`${prefixCls}-${type}`]: type,
    [`${prefixCls}-${sizeCls}`]: sizeCls,
    [`${prefixCls}-icon-only`]: !children && children !== 0 && iconType,
    [`${prefixCls}-background-ghost`]: ghost,
    [`${prefixCls}-loading`]: innerLoading,
    [`${prefixCls}-two-chinese-chars`]: hasTwoCNChar && autoInsertSpace,
    [`${prefixCls}-block`]: block,
  });

  const iconNode = icon && !innerLoading ? icon : innerLoading ? <LoadingOutlined rotating /> : null;

  const kids = children || children === 0 ? spaceChildren(children, isNeedInserted() && autoInsertSpace) : null;

  const { htmlType, ...otherProps } = rest;
  const buttonNode = (
    <button {...otherProps} ref={buttonRef} type={htmlType} className={classes} onClick={handleClick}>
      {iconNode}
      {kids}
    </button>
  );

  return buttonNode;
};

const Button = React.forwardRef<unknown, ButtonProps>(InternalButton) as CompoundedComponent;

Button.defaultProps = {
  loading: false,
  ghost: false,
  block: false,
  htmlType: 'button' as ButtonProps['htmlType'],
};

Button.displayName = 'Button';

Button.__GIO_BUTTON = true;

export default Button;
