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
    //  return this.props.form.setFieldValue(this.props.field.name, e.target.value, true)
    // }

    let value = e.target.value;

    if (this.props.normalize) {
      value = this.props.normalize(
        value,
        this.props.field.value,
        this.props.form.values
      )
    }

    this.props.onChange && this.props.onChange(value)

    return this.props.form.setFieldValue(this.props.field.name, value, true)
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
    // const addonWrapperClassName = classnames({
    //   'input-group-prepend': !this.props.addon.position || this.props.addon.position === 'start',
    //   'input-group-append': this.props.addon.position && this.props.addon.position === 'end',
    // })

    // {/*<span className={`fas fa-${this.props.addon.icon}`} />*/}
    return (
      <div className="input-group-addon">
        <span className="input-group-text">
          {this.props.addon.icon &&
            <span className={`glyphicons glyphicons-${this.props.addon.icon}`} />
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
