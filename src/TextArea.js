import React, { PureComponent } from 'react'
import { bool, object, string } from 'prop-types'
import classnames from 'classnames'


class TextArea extends PureComponent {

  getInputClassName = () => {
    const { className, capitalize, uppercase, lowercase } = this.props

    return classnames(className, {
      'text-lowercase': lowercase,
      'text-uppercase': uppercase,
      'text-capitalize': capitalize,
    })
  }

  handleChange = (e) => {
    return this.props.form.setFieldValue(this.props.field.name, e.target.value, true)
  }

  renderTextArea = () => {
    const { field, rows, placeholder, disabled, style } = this.props
    const inputClassName = this.getInputClassName()

    return (
      <textarea
        {...field}
        rows={rows}
        style={style}
        className={inputClassName}
        placeholder={placeholder}
        disabled={disabled}
      />
    )
  }

  render() {
    return (
      <div>
        {this.renderTextArea()}
      </div>
    )
  }
}


TextArea.defaultProps = {
  autoComplete: true,
  className: 'form-control',
  capitalize: false,
  uppercase: false,
  lowercase: false,
  required: true,
  rows: 3,
  disabled: false,
}

TextArea.propTypes = {
  form: object.isRequired,
  field: object.isRequired,
  autoComplete: bool,
  capitalize: bool,
  className: string,
  disabled: bool,
  lowercase: bool,
  placeholder: string,
  uppercase: bool,
}

export default TextArea
