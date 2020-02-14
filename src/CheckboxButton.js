import React from 'react'
import { bool, object, oneOfType, number, string } from 'prop-types'
import classnames from 'classnames'

const CheckboxButton = (props) => {
  const {
    field: { name, value, onBlur },
    id,
    children,
    class: className,
    disabled,
    disableMargin,
    fullWidth,
    multiline,
    size,
    text,
    align,
    transparent,
    tabIndex,
  } = props

  const checked = value === true
  const labelClassName = classnames('clickable', {
    'btn btn-outline-secondary': !transparent,
    'btn-multiline text-left': multiline,
    [`btn-${size}`]: size,
    'active': checked,
    'disabled': disabled,
    [`text-${align}`]: align,
    'w-100': fullWidth,
    [className]: className,
  })

  return (
      <label hltmfor={id} className={labelClassName}>
        <input
          type="checkbox"
          name={name}
          id={id}
          checked={checked}
          disabled={disabled}
          tabIndex={tabIndex}
          onBlur={onBlur}
          onChange={() => {
            if (props.hasOwnProperty('onChange')) {
              props.onChange(!value)
            }

            props.form.setFieldValue(name, !value, true)
          }}
        />
        {!disableMargin && <span className="mr-1" />}
        {children && children}
        {text && text}
      </label>

  )
}

CheckboxButton.defaultProps = {
  id: null,
  disabled: false,
  disableMargin: false,
  multiline: false,
  tabIndex: null,
  transparent: false
}

CheckboxButton.propTypes = {
  field: object.isRequired,
  children: oneOfType([object, string]),
  text: string,
  id: string,
  align: string,
  fullWidth: bool,
  disabled: bool,
  disableMargin: bool,
  multiline: bool,
  size: string,
  tabIndex: number,
  transparent: bool
}

export default CheckboxButton
// export default createFieldComponent(CheckboxButton)
