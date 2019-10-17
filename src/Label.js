import React from 'react'
import { bool, func, string } from 'prop-types'
import classnames from 'classnames'


const renderIcon = (required, hasErrors, hasValue, iconPosition = 'start') => {
  const iconClassName = classnames('fas', {
    'fa-check text-success': required && !hasErrors && hasValue,
    'fa-asterisk text-warning': hasErrors || required && !hasValue,
    'mr-2': iconPosition === 'start',
    'ml-2': iconPosition === 'end'
  })

  return <span className={iconClassName} />
}

const Label = ({ label, render, required, hasErrors, hasValue }) => {
  if (render) {
    return render()
  } else if (label) {

    if (typeof label === 'object') {

      const iconPosition = label.iconPosition || 'start'
      const labelClassName = classnames({
        'text-uppercase': typeof label === 'object' && label.uppercase,
        [label.class]: label.hasOwnProperty('class')
      })

      return (
        <div>
          <label className={labelClassName}>
            {iconPosition === 'start' && renderIcon(required, hasErrors, hasValue, iconPosition)}
            {label.text}
            {iconPosition === 'end' && renderIcon(required, hasErrors, hasValue, iconPosition)}
          </label>
        </div>
      )

    } else {

      return (
        <div>
          <label>
            {required && !hasErrors && hasValue &&
              <span className="fas fa-check text-success" />
            }
            {(hasErrors || required && !hasValue) &&
              <span className="fas fa-asterisk text-danger" />
            }
            {' '}
            {label}
          </label>
        </div>
      )

    }


  }
}

Label.propTypes = {
  required: bool.isRequired,
  hasErrors: bool.isRequired,
  hasValue: bool.isRequired,
  text: string,
  render: func
}

export default Label
