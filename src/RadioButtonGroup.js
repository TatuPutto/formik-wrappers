import React from 'react'
import { array, bool, object, string } from 'prop-types'
// import { Field } from 'formik'
// import RadioButton from './RadioButton'
import classnames from 'classnames';


const RadioButtonGroup = (props) => {
  const {
    field: { name },
    // fieldComponent: FieldComponent,
    options,
    disabled,
    disableMargin,
    size,
    fullWidth,
    vertical
  } = props

  const wrapperClassName = classnames({
    'btn-group': !vertical,
    'btn-group-vertical': vertical,
    'w-100': fullWidth
  })

  return (
    <div className={wrapperClassName}>
      {props.children}
    </div>
  )
}

RadioButtonGroup.defaultProps = {
  id: null,
  disabled: false,
  disableMargin: false,
  fullWidth: false,
  vertical: false,
}

RadioButtonGroup.propTypes = {
  field: object.isRequired,
  options: array.isRequired,
  label: string,
  disabled: bool,
  disableMargin: bool,
  size: string,
  fullWidth: bool,
  vertical: bool,
}

export default RadioButtonGroup
