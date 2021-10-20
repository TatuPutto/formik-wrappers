import React, { PureComponent } from 'react'
import { array, bool, func, number, object, string } from 'prop-types'
import { Field, getIn } from 'formik'
import classnames from 'classnames'
import Text from '../Text'


class Question extends PureComponent {

  state = {
    isHover: false,
    showingOptionalClarification: false,
  }

  toggleHover = () => {
    this.setState({
      isHover: !this.state.isHover, 
    })
  }

  toggleOptionalClarification = () => {
    this.setState({
      showingOptionalClarification: !this.state.showingOptionalClarification, 
    })
  }

  getAnswer = () => {
    const fieldValue = getIn(this.props.form.values, this.props.field.name)

    if (fieldValue) {
      return fieldValue.value
    }

    if (!fieldValue && this.props.multiAnswer) {
      return []
    }
  }

  hasBeenAnswered = () => {
    const answer = this.getAnswer()

    if (this.props.multiAnswer) {
      return answer && !!answer.length
    }

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

    if (clarificationConfig.hasOwnProperty('required')) {
      return true
    }

    if (clarificationConfig.hasOwnProperty('requiredWhenValueIs')) {
      if (Array.isArray(clarificationConfig.requiredWhenValueIs)) {
        return clarificationConfig.requiredWhenValueIs
          .some(this.answerMatches)
      }
      return this.answerMatches(clarificationConfig.requiredWhenValueIs)
    }
  }

  answerCanHaveOptionalClarification = () => {
    const clarificationConfig = this.props.clarification

    if (
      !clarificationConfig ||
      !clarificationConfig.hasOwnProperty('optionalWhenValueIs')
    ) {
      return false
    }

    if (Array.isArray(clarificationConfig.optionalWhenValueIs)) {
      return clarificationConfig.optionalWhenValueIs
        .some(value => this.answerMatches(value, false))
    }

    return this.answerMatches(clarificationConfig.optionalWhenValueIs, false)
  }

  answerMatches = (answerToMatch, acceptMissingAnswerAsMatch = false) => {
    const answer = this.getAnswer()

    if (this.props.multiAnswer) {
      return answer.includes(answerToMatch) ||
             acceptMissingAnswerAsMatch && answer == undefined
    }

    return answerToMatch === this.getAnswer() ||
           acceptMissingAnswerAsMatch && answer == undefined
  }

  shouldDisplayClarification = () => {
    return this.hasBeenAnswered() &&
           this.answerRequiresClarification() ||
           this.answerCanHaveOptionalClarification() &&
           this.state.showingOptionalClarification
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

  renderOptionalClarificationHint = () => {
    if (this.props.condenseLayout) {
      return null;
    }

    let style = {
      transition: 'opacity 150ms, transform 300ms',
      position: 'absolute',
      bottom: '-1.25rem',
      opacity: 0,
    }
    
    if (this.state.isHover) {
      style = {
        ...style,
        opacity: 1,
        transform: 'translateY(0rem)',
      }
    }

    return (
      <div style={style}>
        <small className="text-info">
          <a>
            <span className="far fa-plus mr-1" />
            {this.props.optionalClarificationHint || 'Lisää kuvaus toimenpiteestä'}
          </a>
        </small>
      </div>
    )
  }

  renderQuestion = () => {
    const canHaveOptionalClarification =
      this.answerCanHaveOptionalClarification() && !this.props.isSection 
    const shouldRenderOptionalClarificationHint =
      canHaveOptionalClarification && !this.state.showingOptionalClarification

    const labelWrapperStyles = {
      position: 'relative',
      transition: 'transform 300ms',
      ...this.props.depth && !this.props.condenseLayout ? { marginLeft: `${this.props.depth}rem` } : null,
      ...this.state.isHover && shouldRenderOptionalClarificationHint ? { transform: 'translateY(-0.75rem)' } : null,
    }

    const labelEl = (
      <div style={labelWrapperStyles}>
        <div
          className="question-label-wrapper"
        >
          {this.props.isSection ?
            <b>{this.props.label}</b>
            :
            <span>{this.props.label}</span>
          }
          {this.props.hint &&
            <div className="text-muted">
              <small>{this.props.hint}</small>
            </div>
          }
        </div>
        {shouldRenderOptionalClarificationHint && this.renderOptionalClarificationHint()}
        {this.shouldDisplayClarification() && this.renderClarification()}
      </div>
    )

    let optionEls = []

    if (!this.props.isSection || this.props.answerable) {
      optionEls = this.props.renderOptions(`${this.props.field.name}.value`)
    } else {
      for (let i = 0; i < this.props.options.length; i++) {
        optionEls.push(<td /> )
      }
    }

    if (this.props.condenseLayout) {

      const wrapperClassName = classnames('wrapper', { 'py-2': this.props.depth === 0 })
      const nestedWrapperClassName = classnames('wrapper', { 'py-2': this.props.depth > 0 })

      const wrapperStyle = this.props.depth ?
        { borderLeft: '3px solid #c6c6c6' } :
        { borderBottom: '1px solid rgb(198, 198, 198)' }

      let nestedWrapperStyle = {}

      if (this.props.depth > 0) {
        nestedWrapperStyle.marginLeft = `${this.props.depth}rem`

        if (this.props.isLast) {
          nestedWrapperStyle.borderBottom = '1px solid rgb(198, 198, 198)'
        }
      }

      return (
        <div
          className={wrapperClassName}
          style={wrapperStyle}
        >
          <div
            className={nestedWrapperClassName}
            style={nestedWrapperStyle}
          >
            <div
              className={
                classnames('py-1 font-weight-bold', {
                  'clickable': canHaveOptionalClarification
                })
              }
              onMouseEnter={this.toggleHover}
              onMouseLeave={this.toggleHover}
              onClick={this.toggleOptionalClarification}
            >
              {labelEl}
            </div>
            <div className="py-1 d-flex flex-row justify-content-between">
              {optionEls}
            </div>
          </div>
        </div>
      )
    }

    return (
      <tr
        onMouseEnter={this.toggleHover}
        onMouseLeave={this.toggleHover}
      >
        {this.props.alignOptionsLeft && optionEls}
        <td
          className={classnames({ 'clickable': canHaveOptionalClarification })}
          onClick={this.toggleOptionalClarification}
        >
          {labelEl}
        </td>
        {!this.props.alignOptionsLeft && optionEls}
      </tr>
    )
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
  hint: string,
  alignOptionsLeft: bool,
  clarification: object,
  depth: number,
  renderOptions: func,
}

export default Question
