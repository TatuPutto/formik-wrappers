import React, { PureComponent } from 'react'
import { bool, func, object, string } from 'prop-types'
import { getIn } from 'formik'
import classnames from 'classnames'
import Label from './Label'


const createFieldComponent = (Component) => {

  return class FieldComponent extends PureComponent {

    static propTypes = {
      form: object.isRequired,
      field: object.isRequired,
      disableGutter: bool.isRequired,
      displayErrorMessage: bool.isRequired,
      required: bool.isRequired,
      label: string,
      renderLabel: func,
    }

    getErrors = () => {
      return getIn(this.props.form.errors, this.props.field.name)
    }

    getValue = () => {
      return getIn(this.props.form.values, this.props.field.name)
    }

    isTouched = () => {
      return getIn(this.props.form.touched, this.props.field.name)
    }

    hasErrors = () => {
      return Boolean(this.getErrors())
    }

    hasValue = () => {
      return Boolean(this.getValue())
    }

    renderLabel = () => {
      const { label, renderLabel, required } = this.props

      if (label) {
        return (
          <Label
            label={label}
            render={renderLabel}
            required={required}
            hasErrors={this.hasErrors()}
            hasValue={this.hasValue()}
          />
        )
      } else if (renderLabel) {
        return renderLabel()
      }
    }

    renderErrorMessage = () => {
      if (!this.props.displayErrorMessage) return null

      const error = this.getErrors()
      const touched = this.isTouched()

      if (error && touched) {
        return (
          <div className="text-danger mt-1">
            <small>
              <span className="fas fa-exclamation-circle fa-fw mr-1" />
              {error}
            </small>
          </div>
        )
      }
    }

    render() {
      const wrapperClassName = classnames({
        'form-group': !this.props.disableGutter
      })

      return (
        <div className={wrapperClassName}>
          {this.renderLabel()}
          <Component {...this.props} />
          {this.renderErrorMessage()}
        </div>
      )
    }

  }

}

export default createFieldComponent
