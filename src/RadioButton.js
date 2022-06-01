import React from 'react'
import { bool, object, oneOfType, number, string } from 'prop-types'
import classnames from 'classnames'

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
    interactive,
    size,
    fullWidth,
    width,
    style,
    transparent,
    tabIndex
  } = props

  const checked = value === checkedValue
  const labelClassName = classnames({
    'btn btn-outline-secondary mb-0': !transparent,
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

  function handleOnBlur(e) {
    if (!interactive) {
      return;
    }

    return onBlur(e);
  }

  function handleOnChange(e) {
    if (!interactive) {
      return;
    }

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
        onBlur={handleOnBlur}
        onChange={handleOnChange}
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
  interactive: true,
  disabled: false,
  disableMargin: false,
  fullWidth: false,
  transparent: false,
  tabIndex: null,
}

RadioButton.propTypes = {
  field: object.isRequired,
  checkedValue: oneOfType([bool, string]).isRequired,
  children: oneOfType([object, string]),
  text: string,
  interactive: bool,
  transparent: bool,
  align: string,
  disabled: bool,
  disableMargin: bool,
  id: string,
  size: string,
  tabIndex: number
}

export default RadioButton
