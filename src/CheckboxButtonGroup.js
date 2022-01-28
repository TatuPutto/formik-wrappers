import React from 'react'
import { bool, func, object, oneOfType } from 'prop-types'
import classnames from 'classnames';
import createFieldComponent from './createFieldComponent'

const CheckboxButtonGroup = (props) => {
  const wrapperClassName = classnames({
    'btn-group': !props.vertical,
    'btn-group-vertical': props.vertical,
    'w-100': props.fullWidth
  })

  return (
    <div className={wrapperClassName}>
      {props.children}
    </div>
  )
}

CheckboxButtonGroup.defaultProps = {
  vertical: false,
  fullWidth: false,
}

CheckboxButtonGroup.propTypes = {
  field: object.isRequired,
  fullWidth: bool,
  children: oneOfType([func, object]).isRequired,
  vertical: bool,
}

export default createFieldComponent(CheckboxButtonGroup)
