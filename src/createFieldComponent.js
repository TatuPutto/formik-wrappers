import React, { PureComponent, Fragment } from 'react'
import { bool, func, object, string } from 'prop-types'
import { getIn } from 'formik'
import classnames from 'classnames'
import Label from './Label'
import colors from './constants'

const defaultArgs = {
  withWrapper: true,
  withLabel: true,
  withError: true
}

const createFieldComponent = (Component, args = defaultArgs) => {

  return class extends PureComponent {

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

    getHighlightStyles = () => {
      const { highlightWhenRequired, highlightWhenError } = this.props
      const hasErrors = this.hasErrors()
      const value = this.getValue()
      const styles = {}

      if (highlightWhenError && hasErrors) {
        styles.borderColor = colors.error
      }

      if (highlightWhenRequired && (value === null || value === undefined)) {
        styles.borderColor = colors.warning
      }

      return styles
    }

    renderLabel = () => {
      if (!args.withLabel) {
        return null
      }

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
      if (!args.withError || !this.props.displayErrorMessage) {
        return null
      }

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
      return <Component {...this.props} />


      if (args.withWrapper) {
        const wrapperClassName = classnames({
          'form-group': !this.props.disableGutter
        })

        return (
          <div className={wrapperClassName}>
            {this.renderLabel()}
            <Component
              {...this.props}
              style={this.getHighlightStyles()}
            />
            {this.renderErrorMessage()}
          </div>
        )
      } else {
        return (
          <Fragment>
            {this.renderLabel()}
            <Component
              {...this.props}
              style={this.getHighlightStyles()}
            />
            {this.renderErrorMessage()}
          </Fragment>
        )
      }

    }

  }

}

export default createFieldComponent
