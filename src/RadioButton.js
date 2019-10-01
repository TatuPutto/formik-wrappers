import React from 'react'
import { bool, object, oneOfType, number, string } from 'prop-types'
import classnames from 'classnames'


const RadioButton = (props) => {
  const {
    field: { name, value, onChange, onBlur },
    children,
    text,
    align,
    checkedValue,
    disabled,
    disableMargin,
    id,
    size,
    tabIndex
  } = props

  const checked = value === checkedValue
  const labelClassName = classnames('btn btn-outline-secondary', {
    'active': checked,
    'disabled': disabled,
    [`btn-${size}`]: size,
    [`text-${align}`]: align
  })

  return (
    <label hltmfor={id} className={labelClassName}>
      <input
        name={name}
        type="radio"
        id={id}
        checked={checked}
        value={checkedValue}
        onBlur={onBlur}
        onChange={onChange}
        disabled={disabled}
        tabIndex={tabIndex}
      />
      {!disableMargin && <span className="mr-1" />}
      {children && children}
      {text && text}
    </label>
  )
}

RadioButton.defaultProps = {
  id: null,
  disabled: false,
  disableMargin: false,
  tabIndex: null,
}

RadioButton.propTypes = {
  field: object.isRequired,
  checkedValue: oneOfType([bool, string]).isRequired,
  children: oneOfType([object, string]),
  text: string,
  align: string,
  disabled: bool,
  disableMargin: bool,
  id: string,
  size: string,
  tabIndex: number
}

export default RadioButton
