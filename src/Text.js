import React, { PureComponent } from 'react'
import { bool, func, object, string } from 'prop-types'
import classnames from 'classnames'
import createFieldComponent from './createFieldComponent'


class Text extends PureComponent {

  getInputClassName = () => {
    const { className, capitalize, uppercase, lowercase } = this.props

    return classnames(className, {
      'text-lowercase': lowercase,
      'text-uppercase': uppercase,
      'text-capitalize': capitalize
    })
  }

  handleChange = (e) => {
    // if (this.props.onChange) {
    //   return this.props.onChange(e, this.props.field.onChange)
    // } else {
      return this.props.form.setFieldValue(this.props.field.name, e.target.value, true)
    // }
  }

  renderInput = () => {
    const { field, placeholder, autoComplete, disabled, style } = this.props
    const inputClassName = this.getInputClassName()

    return (
      <input
        {...field}
        type="text"
        style={style}
        className={inputClassName}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete ? 'on' : 'off'}
        value={field.value}
        onChange={this.handleChange}
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
  required: true,
  disabled: false,
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
