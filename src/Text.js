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
    let value = e.target.value;

    if (this.props.normalize) {
      value = this.normalizeValue(value);
    }

    this.props.onChange && this.props.onChange(value)

    return this.props.form.setFieldValue(this.props.field.name, value, true)
  }

  normalizeValue = (value) => {
    if (typeof this.props.normalize === 'function') {
      return this.props.normalize(
        value,
        this.props.field.value,
        this.props.form.values
      )
    }

    if (!value || value.length === 0) {
      return value
    }

    const prevValueLength = this.props.field.value && this.props.field.value.length || 0
    const valueLength = value && value.length || 0
    if (prevValueLength > valueLength) {
      return value
    }

    const pattern = new RegExp(this.props.normalize)

    if (pattern.test(value)) {
      return value
    }

    if (!this.props.field.value) {
      return ''
    }

    return this.props.field.value
  }

  renderInputWithAddon = () => {
    return (
      <div className="input-group">
        {!this.props.addon.position || this.props.addon.position === 'start' &&
          this.renderAddon()
        }
        {this.renderInput()}
        {this.props.addon.position && this.props.addon.position === 'end' &&
          this.renderAddon()
        }
      </div>
    )
  }

  renderAddon = () => {
    const addonWrapperClassName = classnames({
      'input-group-prepend': !this.props.addon.position || this.props.addon.position === 'start',
      'input-group-append': this.props.addon.position && this.props.addon.position === 'end',
    })

    return (
      <div className={addonWrapperClassName}>
        <span className="input-group-text">
          {this.props.addon.icon &&
            <span className={`far fa-${this.props.addon.icon}`} />
          }
          {this.props.addon.text &&
            <span>{this.props.addon.text}</span>
          }
        </span>
      </div>
    )
  }

  renderInput = () => {
    const {
      field,
      type,
      placeholder,
      autoComplete,
      disabled,
      style
    } = this.props
    const inputClassName = this.getInputClassName()

    return (
      <input
        {...field}
        type={type}
        style={style}
        className={inputClassName}
        placeholder={placeholder}
        disabled={disabled}
        min={this.props.min}
        max={this.props.max}
        autoComplete={autoComplete ? 'on' : 'off'}
        value={field.value}
        onChange={this.handleChange}
      />
    )
  }

  render() {
    return (
      <div>
        {this.props.addon ?
          this.renderInputWithAddon()
          :
          this.renderInput()
        }
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
  type: "text",
}

Text.propTypes = {
  form: object.isRequired,
  field: object.isRequired,
  addon: string,
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
  type: string,
  uppercase: bool,
}

export default createFieldComponent(Text)
