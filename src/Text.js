import React, { PureComponent } from 'react'
import { bool, func, object, string } from 'prop-types'
import classnames from 'classnames'
import createFieldComponent from './createFieldComponent'


class Text extends PureComponent {

  createInputClassName = () => {
    const { className, capitalize, uppercase, lowercase } = this.props

    return classnames(className, {
      'text-lowercase': lowercase,
      'text-uppercase': uppercase,
      'text-capitalize': capitalize
    })
  }

  renderInput = () => {
    const { field, placeholder, autoComplete } = this.props

    return (
      <input
        {...field}
        type="text"
        className={this.createInputClassName()}
        placeholder={placeholder}
        autoComplete={autoComplete ? 'on' : 'off'}
      />
    )
  }

  render() {
    return (
      <div>
        {this.renderInput()}
      </div>
    )
  }
}


Text.defaultProps = {
  autoComplete: true,
  className: "form-control",
  capitalize: false,
  uppercase: false,
  lowercase: false,
  labelClassName: "upper-label",
  required: true
}

Text.propTypes = {
  form: object.isRequired,
  field: object.isRequired,
  autoComplete: bool,
  capitalize: bool,
  className: string,
  disabled: bool,
  displayErrorMessage: bool,
  label: string,
  lowercase: bool,
  placeholder: string,
  renderLabel: func,
  required: bool,
  uppercase: bool,
}

export default createFieldComponent(Text)
