import React from 'react'
import { bool, object, oneOfType, number, string } from 'prop-types'
import classnames from 'classnames'
import createFieldComponent from './createFieldComponent'


const RadioButton = (props) => {
  const {
    form: { setFieldValue },
    field: { name, value, onBlur },
    onChange,
    children,
    text,
    align,
    checkedValue,
    disabled,
    disableMargin,
    id,
    size,
    fullWidth,
    width,
    style,
    tabIndex
  } = props

  const checked = value === checkedValue
  const labelClassName = classnames('btn btn-outline-secondary mb-0', {
    'active': checked,
    'disabled': disabled,
    [`btn-${size}`]: size,
    [`text-${align}`]: align,
    'w-100': fullWidth
  })

  const labelStyles = {
    ...style,
    ...width ? { width } : null
  }

  return (
    <label
      hltmfor={id}
      className={labelClassName}
      style={labelStyles}
    >
      <input
        name={name}
        type="radio"
        id={id}
        checked={checked}
        value={checkedValue}
        onBlur={onBlur}
        onChange={(e) => {
          if (e.target.value === 'true') {
            setFieldValue(name, true)
            onChange && onChange(true)
          } else if (e.target.value === 'false') {
            setFieldValue(name, false)
            onChange && onChange(false)
          } else {
            props.field.onChange(e)
            onChange && onChange(e)
          }
        }}
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
  fullWidth: false,
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

export default createFieldComponent(
  RadioButton,
  { withLabel: false, withError: false, withWrapper: false }
)
