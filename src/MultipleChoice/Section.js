import React from 'react'
import { array, bool, string } from 'prop-types'
import { Field } from 'formik'
import OptionControl from './OptionControl'


const Section = (props) => {

  const colSpan = props.options.length
  const optionEls = []

  if (props.answerable) {
    optionEls.push(props.renderOptions(`${props.field.name}.value`))
  } else {
    for (let i = 0; i < colSpan; i++) {
      optionEls.push(<td /> )
    }
  }

  const labelEl = (
    <span className={props.nested ? "ml-3" : null}>
      <i>
        {props.label}
      </i>
    </span>
  )

  if (props.condenseLayout) {
    return (
      <div className="mt-3 mb-1">
        <div className="mb-2 font-weight-bold">
          {labelEl}
        </div>
        <div className="py-1 d-flex flex-row justify-content-between">
          {optionEls}
        </div>
      </div>
    )
  }

  if (props.alignOptionsLeft) {
    return (
      <tr>
        {optionEls}
        <td>
          {labelEl}
        </td>
      </tr>
    )
  } else {
    return (
      <tr>
        <td>
          {labelEl}
        </td>
        {optionEls}
      </tr>
    )
  }
}

Section.defaultProps = {
  alignOptionsLeft: false,
  nested: false,
}

Section.propTypes = {
  options: array.isRequired,
  label: string.isRequired,
  alignOptionsLeft: bool,
  nested: bool,
}

export default Section
