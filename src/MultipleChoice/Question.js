import React, { PureComponent } from 'react'
import { array, bool, func, object, string } from 'prop-types'
import { Field, getIn } from 'formik'
import RadioButton from '..//RadioButton'
import RadioButtonGroup from '../RadioButtonGroup'
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

  renderOptions = () => {
    const name = `${this.props.field.name}.value`

    if (this.props.renderOptions) {
      return this.props.renderOptions(name)
    } else {
      return (
        <Field
          name={name}
          required
          fullWidth
          disableGutter
          component={RadioButtonGroup}
        >
          {this.props.options.map((option) => (
            <Field
              name={name}
              key={`${name}-${option}`}
              id={`${name}-${option}`}
              checkedValue={option.value}
              style={{ width: '50%' }}
              fullWidth
              component={RadioButton}
            />
          ))}
        </Field>
      )
    }
  }

  renderQuestion = () => {
    const colSpan = this.props.options.length

    const labelTd = (
      <td className="align-middle py-2">
        <div className={this.props.nested ? "ml-3" : null}>
          {this.props.label}
          {this.shouldDisplayClarification() && this.renderClarification()}
        </div>
      </td>
    )

    // const optionsTd = (
    //   <td colSpan={colSpan} className="py-2">
    //     {this.renderOptions()}
    //   </td>
    // )
    const optionsTd = this.renderOptions();

    if (this.props.alignOptionsLeft) {
      return (
        <tr>
          {optionsTd}
          {labelTd}
        </tr>
      )
    } else {
      return (
        <tr>
          {labelTd}
          {optionsTd}
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
  nested: false,
}

Question.propTypes = {
  form: object.isRequired,
  field: object.isRequired,
  options: array.isRequired,
  label: string.isRequired,
  alignOptionsLeft: bool,
  clarification: object,
  nested: bool,
  renderOptions: func,
}

export default Question
