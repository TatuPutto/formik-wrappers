import React, { Fragment, PureComponent } from 'react'
import { array, bool, func, number, object, string } from 'prop-types'
import { Field, getIn } from 'formik'
import classnames from 'classnames'
import Text from '../Text'
import { isArray, isEmpty, isNull, isPlainObject, isString, isUndefined, noop } from 'lodash'


class Question extends PureComponent {

  constructor(props) {
    super(props)
    const intialShowingOptionalClarification =
      this.answerCanHaveOptionalClarification(props) &&
      this.clarificationContainsData(props)
    this.state = {
      isHover: false,
      showingOptionalClarification: intialShowingOptionalClarification,
      clarificationHintInitialRenderDone: false,
      clarificationHintRenderDelayStarted: false,
    }
  }
  
  componentDidUpdate(_, prevState) {
    if (
      !prevState.clarificationHintRenderDelayStarted &&
      this.state.clarificationHintRenderDelayStarted
    ) {
      setTimeout(() => {
        this.setState({
          clarificationHintInitialRenderDone: true,
        })
      }, 150)
    }
  }

  toggleHover = () => {
    this.setState({
      isHover: !this.state.isHover, 
    })
  }

  toggleOptionalClarification = () => {
    if (this.state.showingOptionalClarification && this.clarificationContainsData()) {
      if (!confirm(this.props.t('Haluatko varmasti poistaa kuvauksen?'))) {
        return
      }
    }

    this.setState({
      showingOptionalClarification: !this.state.showingOptionalClarification,
    }, () => {
      if (!this.state.showingOptionalClarification) {
        this.props.form.setFieldValue(`${this.props.field.name}.clarification`, null, true)
      }
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

  answerCanHaveOptionalClarification = (props = this.props) => {
    const clarificationConfig = props.clarification

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
           (this.state.showingOptionalClarification ||
            this.clarificationContainsData()) ||
           this.shouldDisplayClarificationIfItContainsData()
  }

  shouldDisplayClarificationIfItContainsData = () => {
    if (!getIn(this.props, 'clarification.displayIfFilled')) {
      return false
    }
    return this.clarificationContainsData()
  }

  clarificationContainsData = (props = this.props) => {
    const path = `${props.field.name}.clarification`
    const value = getIn(props.form.values, path)

    if (isNull(value) || isUndefined(value)) {
      return false
    }

    if (isArray(value) && isEmpty(value)) {
      return false
    }

    if (isString(value) && isEmpty(value.trim())) {
      return false
    }

    if (isPlainObject(value)) {
      if (isEmpty(value)) {
        return false
      }

      return Object
        .values(value)
        .some(value => !isNull(value) && !isUndefined(value))
    }

    return true
  }

  renderClarification = () => {
    const name = `${this.props.field.name}.clarification`

    if (this.props.renderClarification) {
      return (
        <div style={{ marginBottom: '1rem', padding: '0rem 0.75rem 0 0.75rem' }}>
          {this.props.renderClarification(name, this.props.clarification)}
        </div>
      )
    } else {
      return (
        <div style={{ marginBottom: '1rem', padding: '0rem 0.75rem 0 0.75rem' }}>
          <Field
            name={name}
            required={this.props.clarification.required}
            component={Text}
            label={{
              text: this.props.clarification.label,
              uppercase: true,
            }}
          />
        </div>
      )
    }
  }

  renderOptionalClarificationHint = () => {
    if (this.props.condenseLayout) {
      return null
    }

    let style = {
      transition: 'opacity 120ms ease 50ms',
      position: 'absolute',
      bottom: '-1.25rem',
      opacity: 0,
    }
    
    if (this.state.isHover && this.state.clarificationHintInitialRenderDone) {
      style = {
        ...style,
        opacity: 1,
      }
    }

    if (
      !this.state.clarificationHintInitialRenderDone &&
      !this.state.clarificationHintRenderDelayStarted
    ) {
      this.setState({
        clarificationHintRenderDelayStarted: true,
      })
    }

    return (
      <div style={style}>
        <small>
          <a>
            {this.state.showingOptionalClarification ?
              <span className="text-danger">
                <span className="far fa-trash-alt fa-fw" />
                {this.props.closeOptionalClarificationHint || 'Poista kuvaus toimenpiteestä'}
              </span>
              :
              <Fragment>
                <span className="far fa-plus fa-fw" />
                {this.props.openOptionalClarificationHint || 'Lisää kuvaus toimenpiteestä'}
              </Fragment>
            }
          </a>
        </small>
      </div>
    )
  }

  renderQuestion = () => {
    const canHaveOptionalClarification =
      this.answerCanHaveOptionalClarification() && !this.props.isSection

    const labelWrapperStyles = {
      position: 'relative',
      padding: '1rem .75rem .75rem .75rem',
      overflowY: 'hidden',
      ...this.props.depth && !this.props.condenseLayout ? { marginLeft: `${this.props.depth}rem` } : null,
    }

    const labelInnerWrapperStyles = {
      transition: 'transform 200ms',
      ...this.state.isHover && canHaveOptionalClarification && this.state.clarificationHintInitialRenderDone ? { transform: 'translateY(-0.75rem)' } : null
    }

    const labelEl = (
      <div
        style={labelWrapperStyles}
        className={classnames({ 'clickable': canHaveOptionalClarification })}
        onMouseEnter={this.state.showingOptionalClarification && !this.props.disabled ? this.toggleHover : noop}
        onMouseLeave={this.state.showingOptionalClarification && !this.props.disabled ? this.toggleHover : noop}
        onClick={this.toggleOptionalClarification}
      >
        <div
          style={labelInnerWrapperStyles}
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
          {canHaveOptionalClarification && this.renderOptionalClarificationHint()}
        </div>
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
            >
              <td className="p-0">
                {labelEl}
                {this.shouldDisplayClarification() && this.renderClarification()}
              </td>
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
        onMouseEnter={(this.state.showingOptionalClarification || this.props.disabled) ? noop : this.toggleHover}
        onMouseLeave={(this.state.showingOptionalClarification || this.props.disabled) ? noop : this.toggleHover}
      >
        {this.props.alignOptionsLeft && optionEls}
        <td className="p-0">
          {labelEl}
          {this.shouldDisplayClarification() && this.renderClarification()}
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
  t: func,
}

export default Question
