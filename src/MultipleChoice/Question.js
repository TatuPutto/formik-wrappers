import React, { Fragment, PureComponent } from 'react'
import { array, bool, func, number, object, string } from 'prop-types'
import { Field, getIn } from 'formik'
import classnames from 'classnames'
import Text from '../Text'
import { get, has, isArray, isEmpty, isNull, isPlainObject, isString, isUndefined, noop } from 'lodash'


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

  openHover = () => {
    this.setState({
      isHover: true,
    })
  }

  closeHover = () => {
    this.setState({
      isHover: false,
    })
  }

  toggleHover = () => {
    this.setState({
      isHover: !this.state.isHover, 
    })
  }

  toggleQuestionCriticality = () => {
    if (!get(this.props.form.values, [this.props.field.name, 'isCritical'])) {
      this.toggleHover()
    }

    this.props.form.setFieldValue(
      `${this.props.field.name}.isCritical`,
      !get(this.props.field, 'value.isCritical'),
      true
    )
  }

  toggleOptionalClarification = () => {
    if (this.state.showingOptionalClarification && this.clarificationContainsData()) {
      const confirmationMessage = get(
        this.props, 'clarification.closeOptionalClarificationConfirmation',
        'Haluatko varmasti poistaa kuvauksen?'
      )
      if (!confirm(this.props.t(confirmationMessage))) {
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

    if (this.props.isPrint) {
      return this.clarificationContainsData()
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

  questionCanBeFlaggedAsCritical = (props = this.props) => {
    if (get(props, 'canBeFlaggedAsCritical')) {
      return true
    }

    if (
      !has(props, 'canBeFlaggedAsCriticalWhenAnswerIs') ||
      isUndefined(props.canBeFlaggedAsCriticalWhenAnswerIs)
    ) {
      return false
    }

    if (Array.isArray(props.canBeFlaggedAsCriticalWhenAnswerIs)) {
      return props.canBeFlaggedAsCriticalWhenAnswerIs
        .some(value => this.answerMatches(value, false))
    }

    return this.answerMatches(props.canBeFlaggedAsCriticalWhenAnswerIs, false)
  }

  questionIsFlaggedAsCritical = () => {
    return get(this.props.field, 'value.isCritical')
  }

  answerCanHaveOptionalClarification = (props = this.props) => {
    const clarificationConfig = props.clarification

    if (
      !clarificationConfig ||
      !clarificationConfig.hasOwnProperty('optionalWhenValueIs')
    ) {
      return false
    }

    if (this.questionCanBeFlaggedAsCritical(props)) {
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
    if (!props.field.value) {
      return false
    }

    if (Object.keys(props.field.value).length === 1) {
      return false
    }

    return Object
      .entries(props.field.value)
      .filter(entry => entry[0] !== 'value' && entry[0] !== 'isCritical')
      .some(entry => this.hasData(entry[1]))
  }

  hasData = (value) => {
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
        <div
          style={{
            marginBottom: '0.5rem',
            padding: this.props.checkboxGroupLike ? '0' : '0rem 0.75rem',
            marginLeft: this.props.checkboxGroupLike ? '-20px' :
              this.props.clarification.matchIndent ? `${this.props.depth * 1}rem` : null,
          }}
        >
          {this.props.renderClarification(name, this.props.clarification)}
        </div>
      )
    } else {
      return (
        <div style={{ marginBottom: '0.5rem', padding: '0rem 0.75rem' }}>
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

  renderFlagAsCriticalHint = () => {
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
            {!this.questionIsFlaggedAsCritical() &&
              <Fragment>
                <span className="fas fa-exclamation-circle mr-1" />
                {this.props.t('flagAsCritical')}
              </Fragment>
            }
          </a>
        </small>
      </div>
    )
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
                {this.props.t(get(this.props, 'clarification.closeOptionalClarificationHint', 'removeCountermeasure'))}
              </span>
              :
              <Fragment>
                <span className="far fa-plus fa-fw" />
                {this.props.t(get(this.props, 'clarification.openOptionalClarificationHint', 'addCountermeasure'))}
              </Fragment>
            }
          </a>
        </small>
      </div>
    )
  }

  handleLabelClick = () => {
    if (this.questionCanBeFlaggedAsCritical() || this.questionIsFlaggedAsCritical()) {
      this.toggleQuestionCriticality()
    }
    if (this.answerCanHaveOptionalClarification()) {
      this.toggleOptionalClarification()
    }
    if (this.props.checkboxGroupLike) {
      const nextValue = this.props.field.value && this.props.field.value.value ? null : true
      this.props.form.setFieldValue(`${this.props.field.name}.value`, nextValue, true)
    }
  }

  renderCriticalBadge = () => {
    const badge = (
      <span className={classnames('badge badge-orange', {
        'badge-sm': this.props.disabled,
      })}>
        <span className="far fa-exclamation-circle mr-1" />
        {this.props.t('critical')}
        {!this.props.disabled &&
          <span
            className="fal fa-times fa-fw"
            style={{
              position: 'relative',
              left: '5px',
            }}
          />
        }
      </span>
    )

    return (
      <div>
        {badge}
      </div>
    )
  }

  renderQuestion = () => {
    const isFlaggedAsCritical = this.questionIsFlaggedAsCritical()
    const canBeFlaggedAsCritical = this.questionCanBeFlaggedAsCritical()
    const canHaveOptionalClarification =
      !this.props.isSection && (this.answerCanHaveOptionalClarification() || this.answer)
    const shouldOffsetLabelOnHover = canBeFlaggedAsCritical || canHaveOptionalClarification  
    const canDisplayClarification = this.shouldDisplayClarification()
    const shouldAllocateSpaceForManualClarification =
      this.props.isPrint && !this.props.isSection && !canDisplayClarification && !!this.props.clarification

    const labelWrapperStyles = {
      position: 'relative',
      padding: this.props.isPrint && !this.props.checkboxGroupLike ? '0.25rem 0.75rem' : this.props.checkboxGroupLike ? '0.25rem' : '0.75rem',
      overflowY: 'hidden',
      ...isFlaggedAsCritical && this.props.disabled && !this.props.alignOptionsLeft ? { paddingTop: '1.25rem' } : null,
      ...this.props.depth && !this.props.condenseLayout && !this.props.noIndent ? { marginLeft: `${this.props.depth}rem` } : null,
    }

    const labelInnerWrapperStyles = {
      transition: 'transform 200ms',
      ...this.state.isHover && shouldOffsetLabelOnHover && this.state.clarificationHintInitialRenderDone ? { transform: 'translateY(-0.75rem)' } : null
    }
    
    const labelEl = (
      <div
        style={labelWrapperStyles}
        className={classnames('question-wrapper', {
          'clickable': shouldOffsetLabelOnHover && !this.props.disabled,
          'checkbox-like': this.props.isPrint || this.props.checkboxGroupLike,
        })}
        onMouseEnter={this.state.showingOptionalClarification && !isFlaggedAsCritical && !this.props.disabled ? this.openHover : noop}
        onMouseLeave={this.state.showingOptionalClarification && !isFlaggedAsCritical && !this.props.disabled ? this.closeHover : noop}
        onClick={this.props.disabled ? noop : this.handleLabelClick}
      >
        <div
          style={labelInnerWrapperStyles}
        >
          {this.props.isSection ?
            <b>{this.props.label}</b>
            :
            <span>{this.props.label}</span>
          }
          {this.props.hint && typeof this.props.hint === 'string' &&
            <div className="text-muted">
              <small>{this.props.hint}</small>
            </div>
          }
          {this.props.hint && typeof this.props.hint === 'object' &&
            this.props.renderHint()
          }
          {isFlaggedAsCritical &&
            this.renderCriticalBadge()
          }
          {canBeFlaggedAsCritical && this.renderFlagAsCriticalHint()}
          {canHaveOptionalClarification && this.renderOptionalClarificationHint()}
        </div>
      </div>
    )

    let optionEls = []

    if (!this.props.isSection || this.props.answerable) {
      optionEls = this.props.renderOptions(`${this.props.field.name}.value`, `${this.props.field.name}`)
    }

    if (this.props.isSection && this.props.showOptions && !this.props.answerable) {
      optionEls = this.props.options.map(option => {
        return (
          <td
            key={option.value}
            className="text-center"
            style={{
              width: this.props.optionColumnWidth,
            }}
          >
            <b>
              <div
                dangerouslySetInnerHTML={{ __html: option.label }} // eslint-disable-line
              />
            </b>
          </td>
        )
      })
    }

    // else {
    //   for (let i = 0; i < this.props.options.length; i++) {
    //     optionEls.push(<td /> )
    //   }
    // }

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
              onMouseEnter={this.openHover}
              onMouseLeave={this.closeHover}
            >
              <td className="p-0">
                {labelEl}
                {canDisplayClarification && this.renderClarification()}
                {shouldAllocateSpaceForManualClarification && <div style={{ height: '20px' }} />}
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
        onMouseEnter={(this.props.disabled || this.state.showingOptionalClarification || isFlaggedAsCritical) ? noop : this.openHover}
        onMouseLeave={(this.props.disabled || this.state.showingOptionalClarification || isFlaggedAsCritical) ? noop : this.closeHover}
      >
        {this.props.alignOptionsLeft && optionEls}
        <td
          className={classnames('p-0', {
            'no-border': this.props.checkboxGroupLike,
            'critical': isFlaggedAsCritical && this.props.disabled,
          })}
          colSpan={this.props.isSection && !this.props.showOptions && !this.props.answerable ? this.props.options.length + 1 : null}
          style={{
            ...this.props.checkboxGroupLike ? { border: 'none', cursor: 'pointer' } : null,
          }}
        >
          {labelEl}
          {canDisplayClarification && this.renderClarification()}
          {shouldAllocateSpaceForManualClarification && <div style={{ height: '20px' }} />}
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
