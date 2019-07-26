import React from 'react'
import { bool, func, string } from 'prop-types'

const Label = ({ text, render, required, hasErrors, hasValue }) => {
  if (render) {
    return render()
  } else if (text) {
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
          {text}
        </label>
      </div>
    )
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
