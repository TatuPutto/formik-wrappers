import React from 'react'
import { bool, func, object, oneOfType } from 'prop-types'
import createFieldComponent from './createFieldComponent'

const CheckboxButtonGroup = (props) => {
  return (
    <div className={this.props.vertical ? "btn-group-vertical" : "btn-group"}>
      {props.children}
    </div>
  )
}

CheckboxButtonGroup.defaultProps = {
  vertical: false,
}

CheckboxButtonGroup.propTypes = {
  field: object.isRequired,
  children: oneOfType([func, object]).isRequired,
  vertical: bool,
}

export default createFieldComponent(CheckboxButtonGroup)
