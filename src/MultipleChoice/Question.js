import React, { Fragment, PureComponent } from 'react'
import { array, bool, func, number, object, string } from 'prop-types'
import { Field, getIn } from 'formik'
import classnames from 'classnames'
import OptionControl from './OptionControl'
import Text from '../Text'


class Question extends PureComponent {

  getAnswer = () => {
    const fieldValue = getIn(this.props.form.values, this.props.field.name)

    if (fieldValue) {
      return fieldValue.value
    }
  }

  hasBeenAnswered = () => {
    const answer = this.getAnswer()

    if (answer === undefined || answer === null) {
      return false
    } else {
      return true
    }
  }

  answerRequiresClarification = () => {
    if (!this.props.hasOwnProperty('clarification') || !this.props.clarification) {
      return false
    }

    const clarificationConfig = this.props.clarification

    if (clarificationConfig.hasOwnProperty('requiredWhenValueIs')) {
      return clarificationConfig.requiredWhenValueIs === this.getAnswer()
    }
  }

  shouldDisplayClarification = () => {
    return this.hasBeenAnswered() && this.answerRequiresClarification()
  }

  renderClarification = () => {
    const name = `${this.props.field.name}.clarification`

    if (this.props.renderClarification) {
      return this.props.renderClarification(name, this.props.clarification)
    } else {
      return (
        <Field
          name={name}
          required={this.props.clarification.required}
          component={Text}
          label={{
            text: this.props.clarification.label,
            uppercase: true,
          }}
        />
      )
    }
  }

  renderQuestion = () => {

    const labelWrapperStyles = {
      ...this.props.depth && !this.props.condenseLayout ? { marginLeft: `${this.props.depth}rem` } : null
    }

    const labelEl = (
      <div style={labelWrapperStyles}>
        {this.props.label}
        {this.shouldDisplayClarification() && this.renderClarification()}
      </div>
    )

    const optionEls = this.props.renderOptions(`${this.props.field.name}.value`)

    if (this.props.condenseLayout) {

      const wrapperClassName = classnames('wrapper', { 'py-2': this.props.depth === 0 })
      const nestedWrapperClassName = classnames('wrapper', { 'py-2': this.props.depth > 0 })

      return (
        <div className={wrapperClassName}
          style={this.props.depth > 0 ? { borderLeft: '3px solid #c6c6c6' } :
                                        { borderBottom: '1px solid rgb(198, 198, 198)' }}
        >
          <div className={nestedWrapperClassName} style={this.props.depth > 0 ? { marginLeft: `${this.props.depth}rem`, ...this.props.isLast ? null : { borderBottom: '1px solid rgb(198, 198, 198)' } } : null}>
            <div className="py-1 font-weight-bold">
              {labelEl}
            </div>
            <div className="py-1 d-flex flex-row justify-content-between">
              {optionEls}
            </div>
          </div>
        </div>
      )
    }

    if (this.props.alignOptionsLeft) {
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

  render() {
    return this.renderQuestion()
  }

}

Question.defaultProps = {
  id: null,
  disabled: false,
  disableMargin: false,
  width: '15%',
  alignOptionsLeft: false,
  depth: 0,
}

Question.propTypes = {
  form: object.isRequired,
  field: object.isRequired,
  options: array.isRequired,
  label: string.isRequired,
  alignOptionsLeft: bool,
  clarification: object,
  depth: number,
  renderOptions: func,
}

export default Question
