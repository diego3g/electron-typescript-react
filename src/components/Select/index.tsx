/**
 * @NOTE There's a good chance this is over-engineered. The goal
 * for this is to create a Select component that only renders
 * Option components. It does this by extracting props from the
 * Option components passed to it and creating the physical
 * HTML elements. Option doesn't render anything by default
 * ~reccanti 9/2/2020
 */
import React, { FC } from 'react'
import { Select as StyledSelect, Option as StyledOption } from './styles'

type OptionProps = {
  value: any;
};

export const Option: FC<OptionProps> = () => null

export const Select: FC = ({ children }) => {
  const options = React.Children.toArray(children)
    .filter(
      (child) =>
        typeof child === 'object' && 'type' in child && child.type === Option
    )
    .map((option) => {
      /**
       * We know that "props" will be a property of "option"
       * based on our previous filter
       */
      /* @ts-ignore-next-line */
      const { children, ...props } = option.props
      props.key = props.value
      return React.createElement(StyledOption, props, children)
    })
  return <StyledSelect>{options}</StyledSelect>
}
