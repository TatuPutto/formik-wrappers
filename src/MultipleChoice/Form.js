import React, { PureComponent } from 'react'
import { bool, object, oneOfType, number, string } from 'prop-types'
import classnames from 'classnames'
import { Field, getIn } from 'formik'
import RadioButton from '..//RadioButton'
import RadioButtonGroup from '../RadioButtonGroup'
import Text from '../Text'


class Form extends PureComponent {

  renderHeaders = () => {
    if (this.props.alignOptionsLeft) {
      return (
        <tr>
          {this.renderOptionHeaders()}
          <th />
        </tr>
      )
    } else {
      return (
        <tr>
          <th />
          {this.renderOptionHeaders()}
        </tr>
      )
    }
  }

  renderOptionHeaders = () => {
    return this.props.options.map((option, i) => (
      <th
        key={i}
        className="text-center"
        style={this.getHeaderStyles(i)}
      >
        <div
          dangerouslySetInnerHTML={{ __html: option.label }} // eslint-disable-line
        />
      </th>
    ))
  }

  getHeaderStyles = (i) => {
    const styles = {
      width: this.props.width
    }

    if (i === 0) {
      styles.paddingRight = 0
    }

    if (i === this.props.options.length - 1) {
      styles.paddingLeft = 0
    }

    return styles
  }

  getPathToQuestion = (question, parentSectionName) => {
    if (parentSectionName) {
      return `${this.props.field.name}.${parentSectionName}.${question.name}`
    } else {
      return `${this.props.field.name}.${question.name}`
    }
  }

  hasQuestionBeenAnswered = (question, parentSectionName) => {
    const answer = getIn(this.props.form.values, this.getPathToQuestion(question, parentSectionName))
    console.log('answer: ', answer);
    if (answer === undefined || answer === null) {
      return false
    } else {
      return true
    }
  }

  displayClarification = (question, parentSectionName) => {
    if (!this.hasQuestionBeenAnswered(question, parentSectionName)) {
      return false
    }

    console.log('question has been answered!');

    if (this.props.clarifyAll) {
      return true
    }

    if (question.clarification || question.clarify) {
      console.log('Should display clarification');
      return true
    } else {
      return false
    }
  }

  getClarificationConfig = (question, parentSectionIndex) => {
    if (question.hasOwnProperty('clarification')) return question.clarification
    if (this.props.questions[parentSectionIndex].hasOwnProperty('clarification')) {
      return this.props.questions[parentSectionIndex].clarification
    }

    if (this.props.clarification) return this.props.clarification

  }

  renderClarification = (question, parentSectionIndex, parentSectionName) => {
    const clarificationConfig = this.getClarificationConfig(question, parentSectionIndex)

    console.log('clarificationConfig', clarificationConfig);
    console.log('Path to question: ', this.getPathToQuestion(question, parentSectionName));

    return (
      <div>
        <span className="text-uppercase">
          {clarificationConfig.label}
        </span>
        <div>
          <Field
            name={`${this.props.field.name}.electronic-devices.${question.name}.clarificationValue`}
            type="text"
          />
        </div>
      </div>
    )
  }

  renderQuestions = (questions, parentSectionIndex, parentSectionName = null, clarification = null) => {
    const colSpan = this.props.options.length
    const questionRows = []

    questions.forEach((questionOrSection, i) => {

      const labelTd = (
        <td className="align-middle py-2">
          {questionOrSection.isSection ?
            <i>{questionOrSection.label}</i>
            :
            <span className={parentSectionIndex ? "ml-3" : null}>
              {questionOrSection.label}
              {this.displayClarification(questionOrSection, parentSectionName) &&
                this.renderClarification(questionOrSection, parentSectionIndex, parentSectionName)
              }
            </span>
          }
        </td>
      )

      const optionsTd = (
        <td colSpan={colSpan} className="py-2">
          {!questionOrSection.isSection &&
            this.renderOptions(questionOrSection, parentSectionName)
          }
        </td>
      )

      if (this.props.alignOptionsLeft) {
        questionRows.push(
          <tr key={questionOrSection.name}>
            {optionsTd}
            {labelTd}
          </tr>
        )
      } else {
        questionRows.push(
          <tr key={questionOrSection.name}>
            {labelTd}
            {optionsTd}
          </tr>
        )
      }

      if (questionOrSection.isSection) {
        questionRows.push(
          this.renderQuestions(
            questionOrSection.questions,
            i,
            questionOrSection.name,
            questionOrSection.clarification || clarification,
          ))
      }

    })

    return questionRows

  }

  renderOptions = (question, parentSectionName = null) => {
    if (this.props.renderOptions) {
      return this.props.renderOptions(question, parentSectionName)
    } else {
      return (
        <Field
          name={question.name}
          required
          fullWidth
          disableGutter
          component={RadioButtonGroup}
        >
          {this.props.options.map((option) => (
            <Field
              key={`${name}-${question.name}-${option.value}`}
              name={`${name}.${question.name}`}
              id={question.name}
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

  render() {
    const tableClassName = classnames('table', {
      'table-striped': this.props.striped
    })

    console.log('MultiForm', this.props);

    return (
      <div>
        <table className={tableClassName}>
          <thead>
            {this.renderHeaders()}
          </thead>
          <tbody>
            {this.props.children || this.renderQuestions(this.props.questions)}
          </tbody>
        </table>
      </div>
    )
  }
}

Form.defaultProps = {
  id: null,
  disabled: false,
  disableMargin: false,
  striped: true,
  tabIndex: null,
  width: '15%',
}

Form.propTypes = {
  field: object.isRequired,
  checkedValue: oneOfType([bool, string]).isRequired,
  children: oneOfType([object, string]),
  text: string,
  align: string,
  disabled: bool,
  disableMargin: bool,
  id: string,
  size: string,
  tabIndex: number
}

export default Form
