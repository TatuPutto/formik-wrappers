import React, { Fragment } from 'react'
import { bool, object, oneOfType, number, string, func } from 'prop-types'
import classnames from 'classnames'

const CheckboxButton = (props) => {
  const {
    field: { name, value, onBlur },
    id,
    interactive,
    children,
    class: className,
    disabled,
    disableMargin,
    fullWidth,
    multiline,
    size,
    style,
    strikethrough,
    text,
    align,
    transparent,
    tabIndex,
    label,
  } = props

  const checked = value === true
  const labelClassName = classnames({
    'clickable': interactive && !disabled,
    'btn btn-outline-secondary': !transparent,
    'btn-multiline text-left': multiline,
    [`btn-${size}`]: size,
    'active': checked,
    'disabled': disabled,
    [`text-${align}`]: align,
    'w-100': fullWidth,
    'text-del': strikethrough,
    [className]: className,
  })

  const labelContent = (
    <Fragment>
      <input
        type="checkbox"
        name={name}
        id={id}
        checked={checked}
        disabled={disabled}
        tabIndex={tabIndex}
        style={{ marginRight: text || children ? '4px' : 0 }}
        onBlur={interactive ? onBlur : () => {}}
        onChange={interactive ? () => {
          if (props.hasOwnProperty('onChange')) {
            props.onChange(!value)
          }

          props.form.setFieldValue(name, !value, true)
        } : () => {}}
      />
      {!disableMargin && ' '}
      {children && children}
      {text && text}
    </Fragment>
  )

  if (typeof label === 'function') {
    const Label = label
    return (
      <Label
        labelClassName={labelClassName}
      >
        {labelContent}
      </Label>
    )
  }

  return (
    <label
      hltmfor={id}
      className={labelClassName}
      style={style}
    >
      {labelContent}
    </label>
  )
}

CheckboxButton.defaultProps = {
  id: null,
  interactive: true,
  disabled: false,
  disableMargin: false,
  multiline: false,
  strikethrough: false,
  tabIndex: null,
  style: {},
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
  style: object,
  strikethrough: bool,
  tabIndex: number,
  transparent: bool,
  label: func,
}

export default CheckboxButton
// export default createFieldComponent(CheckboxButton)
