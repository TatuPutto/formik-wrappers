import React from 'react'
import { array, bool, object, string } from 'prop-types'
// import { Field } from 'formik'
// import RadioButton from './RadioButton'
import createFieldComponent from './createFieldComponent'


const RadioButtonGroup = (props) => {
  const {
    field: { name },
    // fieldComponent: FieldComponent,
    options,
    disabled,
    disableMargin,
    size,
    vertical
  } = props

  /*
  <Field
    key={`${name}-${option.value}`}
    id={`${name}-${option.value}`}
    name="sex"
    checkedValue={option.value}
    disabled={disabled}
    disableMargin={disableMargin}
    size={size}
    component={RadioButton}
  >
    {option.label}
  </Field>

  {options.map((option) => (
    <FieldComponent
      key={`${name}-${option.value}`}
      element={{ ... }}
    />

  ))}
  */

  return (
    <div className={vertical ? "btn-group-vertical" : "btn-group"}>
      {props.children}
    </div>
  )
}

RadioButtonGroup.defaultProps = {
  id: null,
  disabled: false,
  disableMargin: false,
  vertical: false,
}

RadioButtonGroup.propTypes = {
  field: object.isRequired,
  options: array.isRequired,
  label: string,
  disabled: bool,
  disableMargin: bool,
  size: string,
  vertical: bool,
}

export default createFieldComponent(RadioButtonGroup)
