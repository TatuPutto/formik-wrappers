import React from 'react'
import { bool, object, oneOfType, number, string } from 'prop-types'
import classnames from 'classnames'
import createFieldComponent from './createFieldComponent'

const CheckboxButton = (props) => {
  const {
    field: { name, value, onChange, onBlur },
    id,
    children,
    disabled,
    disableMargin,
    multiline,
    size,
    text,
    transparent,
    tabIndex
  } = props

  const checked = value === true
  const labelClassName = classnames('clickable', {
    'btn btn-outline-secondary': !transparent,
    'btn-multiline text-left': multiline,
    [`btn-${size}`]: size,
    'active': checked,
    'disabled': disabled
  })

  return (
    <div>
      <label hltmfor={id} className={labelClassName}>
        <input
          type="checkbox"
          name={name}
          id={id}
          checked={checked}
          disabled={disabled}
          tabIndex={tabIndex}
          onBlur={onBlur}
          onChange={onChange}
        />
        {!disableMargin && <span className="mr-1" />}
        {children && children}
        {text && text}
      </label>
    </div>
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
  disabled: bool,
  disableMargin: bool,
  multiline: bool,
  size: string,
  tabIndex: number,
  transparent: bool
}

// export default CheckboxButton
export default createFieldComponent(CheckboxButton)
