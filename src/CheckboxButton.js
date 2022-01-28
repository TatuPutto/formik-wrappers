import React, { Fragment } from 'react'
import { bool, object, oneOfType, number, string, func } from 'prop-types'
import classnames from 'classnames'

const CheckboxButton = (props) => {
  const {
    field: { name, value, onBlur },
    id,
    interactive,
    children,
    checked,
    class: className,
    disabled,
    disableMargin,
    disableBottomMargin,
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
    truncateLabel,
  } = props

  const isChecked = value === true || checked !== undefined && checked;
  const labelClassName = classnames({
    'clickable': interactive && !disabled,
    'btn btn-outline-secondary': !transparent,
    'btn-multiline text-left': multiline,
    [`btn-${size}`]: size,
    'active': isChecked,
    'disabled': disabled,
    [`text-${align}`]: align,
    'w-100': fullWidth,
    'text-del': strikethrough,
    [className]: className,
    'mb-0': disableBottomMargin,
  })

  const Checkbox = (
    <input
      type="checkbox"
      name={name}
      id={id}
      checked={isChecked}
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
  )

  const Text = (
    <Fragment>
      {!disableMargin && ' '}
      {children && children}
      {text && text}
    </Fragment>
  )

  const LabelContent = (
    <Fragment>
      {Checkbox}
      {Text}
    </Fragment>
  )

  if (truncateLabel) {
    return (
      <label
        hltmfor={id}
        className={labelClassName}
        style={style}
      >
        <div className="d-flex align-items-center">
          {Checkbox}
          <div className="truncate">
            {Text}
          </div>
        </div>
      </label>
    );
  }

  if (typeof label === 'function') {
    const Label = label
    return (
      <Label
        labelClassName={labelClassName}
      >
        {LabelContent}
      </Label>
    )
  }

  return (
    <label
      hltmfor={id}
      className={labelClassName}
      style={style}
    >
      {LabelContent}
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
  transparent: false,
  truncateLabel: false,
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
  disableBottomMargin: bool,
  multiline: bool,
  size: string,
  style: object,
  strikethrough: bool,
  tabIndex: number,
  transparent: bool,
  label: func,
  truncateLabel: bool,
}

export default CheckboxButton
// export default createFieldComponent(CheckboxButton)
